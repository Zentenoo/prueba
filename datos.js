import { db } from './src/services/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

const insertData = async () => {
  const dataToInsert = [
    {
      Nombre: 'Nombre1',
      'Razón Social': 'Razón1',
      NIT: '1234567890',
      Telefono: '123-456-7890',
      Codigo: '001'
    },
    // Agrega más objetos de datos aquí...
  ];

  const infoCollectionRef = collection(db, 'info');

  for (const item of dataToInsert) {
    try {
      await addDoc(infoCollectionRef, item);
      console.log('Documento insertado:', item);
    } catch (error) {
      console.error('Error insertando documento:', error);
    }
  }
};
