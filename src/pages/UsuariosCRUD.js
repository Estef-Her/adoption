import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable,{createTheme} from 'react-data-table-component';
import Swal from 'sweetalert2';
import { Card, Button, Container, Row, Col ,Form , Modal,Alert} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
// Definir un tema personalizado
createTheme('customTheme', {
  text: {
    primary: '#4A4A4A', // Color del texto
    secondary: '#2A9D8F',
  },
  background: {
    default: '#FFFFF', // Fondo de la tabla
  },
  divider: {
    default: '#E5E5E5', // Color de los bordes
  },
});
const validationSchema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido'),
  telefono: yup.string().required('El teléfono es requerido'),
  correo: yup.string().email('Correo electrónico inválido').required('El correo electrónico es requerido'),
  rol: yup.string().required('El rol es requerido'),
});
function UsuariosCRUD() {
  const [users, setUsers] = useState([]);
  const [usersC, setUsersC] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: {
      nombre: '',
      telefono: '',
      correo: '',
      contrasena: '',
      rol:''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post('http://localhost:4000/registroUsuarioAd', values);
        if (response.status === 201) {
          handleModalClose(); // Redirigir al usuario al listado de usuarios después de registrar
        }
      } catch (error) {
        setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
      }
    },
  });
  useEffect(() => {
    axios.get('http://localhost:4000/usuarios') // Cambia esta URL a tu endpoint
      .then(response => {
        setUsers(response.data);
        setUsersC(response.data)
      })
      .catch(error => console.error(error));
  }, []);

  const handleModalClose = () => {
    setShowModal(false);
  }
  const handleModalShow = () => setShowModal(true);
  const handleDelete = (userId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás recuperar este registro!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:4000/users/${userId}`)
          .then(() => {
            setUsers(users.filter(user => user.id !== userId));
            Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
          })
          .catch(error => {
            console.error('Error eliminando el usuario:', error);
            Swal.fire('Error!', 'No se pudo eliminar el usuario.', 'error');
          });
      }
    });
  };

  const columns = [
    { name: 'Nombre', selector: row => row.nombre, sortable: true },
    { name: 'Teléfono', selector: row => row.telefono, sortable: true },
    { name: 'Correo', selector: row => row.correo, sortable: true },
    { name: 'Rol', selector: row => ((row.rol === 1) ? 'Administrador' : 'Usuario'), sortable: true },
    {
      name: 'Acciones',
      cell: row => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(row.id)}
        >
          Eliminar
        </button>
      ),
    },
  ];
  const paginationOptions = {
    rowsPerPageText: 'Registros por página:', // Cambia el texto "Rows per page"
    rangeSeparatorText: 'de', // Cambia el texto del separador de rango
    selectAllRowsItem: true, // Habilita la selección de "Todas las filas"
    selectAllRowsItemText: 'Todos', // Texto para seleccionar todas las filas
  };
  return (
    <div className="container mt-4">
<div className="row align-items-center mb-3">
  <h4 className="col-9">Usuarios</h4>
  <div className="col-3 text-end">
    <Button  onClick={handleModalShow} variant="primary">
      Crear usuario
    </Button>
  </div>
</div>

      <DataTable
        columns={columns}
        data={users}
        pagination
        paginationComponentOptions={paginationOptions} 
        theme="customTheme"
        highlightOnHover
        fixedHeader
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Buscar..."
            className="form-control searchTabla"
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              if(value!=""){
                setUsers(users.filter(user =>
                  user.nombre.toLowerCase().includes(value) ||
                  user.telefono.toLowerCase().includes(value) ||
                  user.correo.toLowerCase().includes(value) ||
                  (((user.rol === 1) ? 'Administrador' : 'Usuario')).toLowerCase().includes(value)
                ));
              }else{
                setUsers(usersC);
              }
            }}
          />
        }
      />
      <Modal show={showModal} onHide={handleModalClose}>
    <Modal.Header closeButton>
      <Modal.Title>Registro de usuario</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={formik.handleSubmit}>
        <Form.Group controlId="nombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre"
            value={formik.values.nombre}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.nombre && formik.errors.nombre}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.nombre}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="telefono" className="mt-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            placeholder="Teléfono"
            value={formik.values.telefono}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.telefono && formik.errors.telefono}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.telefono}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="correo" className="mt-3">
          <Form.Label>Correo Electrónico</Form.Label>
          <Form.Control
            type="email"
            placeholder="Correo Electrónico"
            value={formik.values.correo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.correo && formik.errors.correo}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.correo}
          </Form.Control.Feedback>
        </Form.Group>

         <Form.Group controlId="rol" className="mt-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    value={formik.values.rol}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.rol && formik.errors.rol}
                  >
                    <option value="0">Seleccione un rol</option>
                    <option value="1">Administrador</option>
                    <option value="2">Usuario</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.rol}
                  </Form.Control.Feedback>
                </Form.Group>
        {/* <Form.Group controlId="contrasena" className="mt-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Contraseña"
            value={formik.values.contrasena}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.contrasena && formik.errors.contrasena}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.contrasena}
          </Form.Control.Feedback>
        </Form.Group> */}

        <Button variant="primary" type="submit" className="mt-3 login-button">
          Registrar
        </Button>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleModalClose}>
        Cerrar
      </Button>
    </Modal.Footer>
  </Modal>
    </div>
  );
}

export default UsuariosCRUD;
