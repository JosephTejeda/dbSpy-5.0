import React, { useState, useEffect } from 'react';
import useSchemaStore from '../../store/schemaStore';
import useCredentialsStore from '../../store/credentialsStore';
import useDataStore from '../../store/dataStore';

type DeleteTableModalProps = {
    closeDeleteTableModal: () => void;
};

export default function DeleteTableModal({
  closeDeleteTableModal,
  }: DeleteTableModalProps) {
    const [tableName, setTableName] = useState('');
    const [tableNames, setTableNames] = useState<string[]>([]);

    const { dbCredentials } = useCredentialsStore((state) => state);
    const { setSchemaStore } = useSchemaStore((state) => state);
    const { setDataStore } = useDataStore((state) => state);

  useEffect(() => {
    const fetchTableNames = async () => {
      try {
        const response = await fetch(`/api/sql/${dbCredentials.db_type as string}/tableNames`);
        const data: string[] = await response.json();
        setTableNames(data);
      } catch (error: unknown) {
        console.error('Error fetching table names:', error);
      };
    };
      fetchTableNames();
  }, []);

  const handleDelete = async () => {
    const deleteTable = async () => {
      await fetch(`/api/sql/${dbCredentials.db_type}/deleteTable`, {
        method:'DELETE',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({tableName: tableName})
      })
        .then(resetData => resetData.json())
        //   deleteTableSchema(tableName);
        //   deleteTableData(tableName);
        .then(resetData => {
          setSchemaStore(Object.keys(resetData.schema).length >= 1 ? resetData.schema : {});
          setDataStore(Object.keys(resetData.data).length >= 1 ? resetData.data : {});
        })
        .then(() => {
          setTableName('');
        })
        .then(() => {
          closeDeleteTableModal();
        })
        .catch((error) => {
            closeDeleteTableModal();
            setTableName('');
            console.error('Error fetching table names:', error);
        });
    };
    await deleteTable();
  };

  return (
    <div id="deleteTableModal" className="input-modal">
    <div className="modal-content rounded-md bg-[#f8f4eb] shadow-[0px_5px_10px_rgba(0,0,0,0.4)] dark:bg-slate-800 dark:shadow-[0px_5px_10px_#1e293b] w-96">
    <h2 className="text-slate-900 dark:text-[#f8f4eb] text-xl pb-4">Select a table to delete:</h2>
    <ul className="text-slate-900 dark:text-[#f8f4eb]">
      {tableNames.map((name) => (
        <li key={`table-${name}`} className="flex items-center justify-between pb-2">
          {name}{' '}
          <button
            onClick={() => setTableName(name)}
            className="bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
    {tableName && (
      <div className="mt-4 text-slate-900 dark:text-[#f8f4eb]">
        <br></br>
        <h3 className="mb-2 flex justify-center">Are you sure you want to delete the {tableName} table?</h3>
        <div className="flex gap-4 justify-center">
          <button
            onClick={async (e) => {
              e.preventDefault();
              await handleDelete();
              setTableName('');
            }}
            className="text-white bg-red-500 dark:text-[#f8f4eb] rounded-md px-2 py-1 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 border-2 border-red-400"
          >
            Confirm
          </button>{' '}
          <button
            onClick={() => setTableName('')}
            className="text-slate-900 dark:text-[#f8f4eb] rounded-md px-2 py-1 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border-2 border-slate-500"
          >
            Return
          </button>
        </div>
      </div>
    )}
    <br></br>
    <div className="flex justify-center">
    <button
            type="button"
            className="modalButton text-slate-900 hover:opacity-70 dark:text-[#f8f4eb] "
            onClick={ async (e) => {
                e.preventDefault();
                setTableNames([]);
                setTableName('');
                closeDeleteTableModal();
            }}
            data-testid="modal-cancel"
          >
            Cancel
          </button>
</div>
  </div>
  </div>
  );
};
