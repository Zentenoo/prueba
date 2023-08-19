import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { getDocs, collection, query, where, updateDoc, doc } from 'firebase/firestore';
import Select from 'react-select';
import Modal from 'react-modal';

export const Dropbox = () => {
  const [info, setInfo] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedModalData, setEditedModalData] = useState({});
  const [selectedModalData, setSelectedModalData] = useState({});

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
    label: item[selectedAttribute],
  }));
  const attributeOptions = Object.keys(info[0] || {}).map((attribute) => ({
    value: attribute,
    label: attribute,
  }));
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isFocused ? 'blue' : 'black',
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

  const handleAttributeChange = (selectedOption) => {
    setSelectedAttribute(selectedOption.value);
    setSearchText('');
    setSelectedOptions([]);
  };

  const handleSelectOptionChange = (selectedOption) => {
    setSelectedModalData(info.find((item) => item.id === selectedOption.value));
    setEditedModalData(info.find((item) => item.id === selectedOption.value));
    setIsModalOpen(true);
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
      // Update the 'info' array with the edited data
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Select
        styles={customStyles}
        options={attributeOptions}
        value={{ value: selectedAttribute, label: selectedAttribute }}
        onChange={handleAttributeChange}
      />
      {selectedAttribute && (
        <Select
          styles={customStyles}
          options={selectOptions}
          value={selectedOptions}
          isSearchable
          placeholder={`Buscar por ${selectedAttribute}`}
          onChange={handleSelectOptionChange}
        />
      )}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={modalStyles}>
        <div>
          <h2 style={{ color: 'black', marginBottom: '20px' }}>Información detallada</h2>
          <table>
            <tbody>
              {['Nombre', 'Razón Social', 'NIT', 'Telefono', 'Codigo', 'id'].map((attribute) => (
                <tr key={attribute}>
                  <td style={{ color: 'black' }}>{attribute}</td>
                  <td>
                    <input
                      type="text"
                      name={attribute}
                      value={editedModalData[attribute] || ''}
                      onChange={handleModalInputChange}
                    />
                  </td>
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
