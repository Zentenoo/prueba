import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  doc,
  addDoc
} from 'firebase/firestore';
import Select from 'react-select';
import Modal from 'react-modal';

export const Dropbox = () => {
  const [info, setInfo] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState('Nombre');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedModalData, setEditedModalData] = useState({});
  const [selectedModalData, setSelectedModalData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isSecondSelectOpen, setIsSecondSelectOpen] = useState(false);
  const [isNewObjectModalOpen, setIsNewObjectModalOpen] = useState(false);

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
  }, [searchText, isNewObjectModalOpen]);

  const selectOptions = info.map((item) => ({
    value: item.id,
    label: item[selectedAttribute],
  }));

  const attributeOptions = Object.keys(info[0] || {}).map((attribute) => ({
    value: attribute,
    label: attribute,
  }));

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'black',
    }),
    container: (provided) => ({
      ...provided,
      width: '250px',
    }),
  };

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      backgroundColor: 'white',
      border: 'none',
      borderRadius: '8px',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
  };

  const handleAttributeChange = ({ value }) => {
    setSelectedAttribute(value);
    setSearchText('');
    setSelectedOptions([]);
  };

  const handleSelectOptionChange = (selectedOption) => {
    setSelectedModalData(info.find((item) => item.id === selectedOption.value));
    setEditedModalData(info.find((item) => item.id === selectedOption.value));
    setIsSecondSelectOpen(false);
    setIsModalOpen(true);
  };

  const handleNewObjectButtonClick = () => {
    setSelectedModalData({});
    setEditedModalData({});
    setIsNewObjectModalOpen(true);
    setIsSecondSelectOpen(false)
  };

  const handleCreateNewObject = async () => {
    try {
      const newDocRef = await addDoc(infoCollectionRef, editedModalData);
      console.log('New document created with ID: ', newDocRef.id);
      setIsNewObjectModalOpen(false);
    } catch (error) {
      console.error('Error creating new document:', error);
    }
  };

  const handleModalInputChange = (event) => {
    const { name, value } = event.target;
    setEditedModalData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveButtonClick = async () => {
    const docToUpdate = info.find((item) => item.id === selectedModalData.id);

    if (docToUpdate) {
      const updatedInfo = info.map((item) =>
        item.id === selectedModalData.id ? editedModalData : item
      );
      setInfo(updatedInfo);

      try {
        const docRef = doc(db, 'info', selectedModalData.id);
        await updateDoc(docRef, editedModalData);
        console.log('Document updated successfully');
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedModalData({});
    setEditedModalData({});
  };

  const itemsPerPage = 20;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleOptions = selectOptions.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(selectOptions.length / itemsPerPage)) {
      setCurrentPage(newPage);
      setIsSecondSelectOpen(true);
    }
  };
  const handleSelectClick = () => {
    setIsSecondSelectOpen(true);

  };
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Lista de Elementos</h1>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Select
          styles={customStyles}
          options={attributeOptions}
          value={{ value: selectedAttribute, label: selectedAttribute }}
          onChange={handleAttributeChange}
        />
        {selectedAttribute && (
          <div style={{ marginLeft: '10px', flex: 1 }}>
            <Select
              styles={customStyles}
              options={visibleOptions}
              value={selectedOptions}
              isSearchable
              placeholder={`Buscar por ${selectedAttribute}`}
              onChange={handleSelectOptionChange}
              onMenuOpen={handleSelectClick}
              menuIsOpen={isSecondSelectOpen}
            />
          </div>
        )}
        <div style={{ marginRight: '40%' }}>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Anterior
          </button>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={endIndex >= selectOptions.length}>
            Siguiente
          </button>
        </div>
      </div>
      <button onClick={handleNewObjectButtonClick}>Crear Nuevo</button>
      <Modal isOpen={isNewObjectModalOpen} onRequestClose={() => setIsNewObjectModalOpen(false)} style={modalStyles}>
        <div>
          <h2 style={{ color: 'black', marginBottom: '20px' }}>Crear Nuevo Objeto</h2>
          <table>
            <tbody>
              {['Nombre', 'Razón Social', 'NIT', 'Telefono', 'Codigo'].map((attribute) => (
                <tr key={attribute}>
                  <td style={{ color: 'black' }}>{attribute}</td>
                  <input
                    type="text"
                    name={attribute}
                    value={editedModalData[attribute] || ''}
                    onChange={handleModalInputChange}
                  />
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleCreateNewObject}>Crear</button>
            <button onClick={() => setIsNewObjectModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={modalStyles}>
        <div>
          <h2 style={{ color: 'black', marginBottom: '20px' }}>Información detallada</h2>
          <table>
            <tbody>
              {['Nombre', 'Razón Social', 'NIT', 'Telefono', 'Codigo', 'id'].map((attribute) => (
                <tr key={attribute}>
                  <td style={{ color: 'black' }}>{attribute}</td>
                  {attribute === 'id' ? (
                    <span style={{ color: 'black' }}>{selectedModalData.id}</span>
                  ) : (
                    <input
                      type="text"
                      name={attribute}
                      value={editedModalData[attribute] || ''}
                      onChange={handleModalInputChange}
                    />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleSaveButtonClick}>Guardar</button>
            <button onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
