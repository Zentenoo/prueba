import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { getDocs, collection, query, where } from 'firebase/firestore';
import Select from 'react-select';

export const Dropbox = () => {
  const [info, setInfo] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  const infoCollectionRef = collection(db, 'info');
  const queryRef = query(infoCollectionRef, where('Nombre', '>=', searchText)); 

  useEffect(() => {
    const getInfo = async () => {
      try {
        const data = await getDocs(queryRef);
        const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setInfo(filteredData);
      } catch (error) {
        console.error('Error', error);
      }
    };
    getInfo();
  }, [searchText]);

  const selectOptions = info.map((item) => ({
    value: item.id,
    label: item.Nombre
  }));
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isFocused ? 'blue' : 'black',
    }),
    container: (provided) => ({
      ...provided,
      width: '200px', 
    }),
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height: '100vh'}}>
      <Select
        styles={customStyles}
        options={selectOptions}
        isSearchable
        placeholder="Buscar por Nombre"
        onChange={(selectedOption) => {
        }}
      />
    </div>
  );
};


