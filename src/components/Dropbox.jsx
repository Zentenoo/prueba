import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { getDocs, collection, query, where } from 'firebase/firestore';

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

  return (
    <div>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Buscar por Nombre"
      />
      <select>
        {info.map((item) => (
          <option key={item.id} value={item.id}>
            {item.Nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

