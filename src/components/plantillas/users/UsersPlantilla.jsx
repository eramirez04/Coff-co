import React, { useState, useEffect } from "react";
import Mybutton from "../../atoms/Mybutton";
import TableMolecula from "../../molecules/table/TableMolecula";
import Thead from "../../molecules/table/Thead";
import Th from "../../atoms/Th";
import PaginationMolecula from "../../molecules/pagination/PaginationMolecula";
import Tbody from "../../molecules/table/Tbody";
import Search from "../../atoms/Search";
import { FaRegEdit } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { useActualizarEstadoMutation, useActualizarUsuarioMutation, useEliminarUsuarioMutation, useGetUsuarioQuery, useGetRolesQuery, useRegistrarUsuarioMutation } from "../../../store/api/users";
import { useGetRolQuery } from "../../../store/api/roles";
import { Spinner } from "@nextui-org/react";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { Switch } from "@nextui-org/react";

//Importaciones para el modal.
import { IoPersonAddOutline } from "react-icons/io5" ;
import SelectAtomo from "../../atoms/Select";
import SelectAtomoActualizar from "../../atoms/SelectActualizar";
import ModalOrganismo from "../../organismo/Modal/ModalOrganismo";
import Logosímbolo from "../../atoms/Logosímbolo";
import UserFrom from "../../molecules/Formulario/UserFrom";
import InputAtomo from "../../atoms/Input";
import InputAtomoActualizar from "../../atoms/InputActualizar";
import CustomSwitch from "../../atoms/CustomSwitch";
import { useForm } from "react-hook-form";
import { FcOk } from "react-icons/fc";
import Td from "../../atoms/Td";

const UsersPlantilla = () => {

  //CONTROL DE LA PAGINACION
  const [paginaActual,setPaginaActual]= useState(1)
  const itemsPorPagina = 7

  // FUNCIONES CRUD
  const {data,isLoading, refetch} = useGetUsuarioQuery()
  const { data: dato, isLoading: cargando } = useGetRolesQuery();
  const {data: roles, isLoading: cargandoRoles}= useGetRolQuery();
  const [registrarUsuario, { isSuccess, datos, isError, error }] = useRegistrarUsuarioMutation();
  const [actualizarEstado] = useActualizarEstadoMutation();
  const [actualizarUsuario]= useActualizarUsuarioMutation();
  const [eliminarUsuario] = useEliminarUsuarioMutation();

  //FILTRO DE DATOS
  const { t } = useTranslation();
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState(true);

  //MODAL 
  const {handleSubmit, register, watch, setValue, formState: { errors },reset,} = useForm();

  //Abrir modal
  const [openModal, setOpenModal] = useState(false);
  const [openModalActualizar, setOpenModalActualizar] = useState(false);
  const [sucess, setsucess] = useState("");
  const [sucessActualizar, setsucessActualizar] = useState("");

  //MODAL REGISTRAR
  const handleClick = () => {setOpenModal(true);};
  const closeModal = () => {setOpenModal(false);reset()
  };

  //MODAL ACTUALIZAR
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const handleClickActualizar = (usuario) => {
    console.log("Usuario seleccionado:", usuario); 
    setUsuarioSeleccionado(usuario);
    setOpenModalActualizar(true);
  };
    
  //CAMBIAR EL ESTADO DEL USUARIO
  const handleSwitchChange = async (id_usuario, nombre) => {
    confirmAlert({
      title: `${t("confirmacion")}`,
      message: `¿ ${t("cambioestadousuario")}  ${nombre}?`,
      buttons: [
        {
          label: 'Sí',
          onClick: async () => {
            try {
              await actualizarEstado(id_usuario).unwrap();
              toast.success(t("cambioestadoexitoso"));
            } catch (error) {
              toast.error(error.error);
              console.log(t("cambioestadofallido"), error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => toast.warn(t("operacioncancelada"))
        }
      ],
      closeOnClickOutside: true,
    });
  };  

  useEffect(() => {
    console.log("Usuario seleccionado en modal:", usuarioSeleccionado);
    console.log("Valor actual de tipo_documento:", usuarioSeleccionado?.tipo_documento);
  }, [usuarioSeleccionado]);
  
  const closeModalActualizar = () => {setOpenModalActualizar(false);reset()
  };

  //SUBMIT REGISTRAR
  const onsubmit = async (data) => {
    try {
      const response = await registrarUsuario(data).unwrap(); 
      setsucess(response.message); 
  
      toast.success(response.message, {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#333",
          color: "#fff",
        },
        icon: <FcOk />,
      });

      console.log('Valores enviados', data)
      setOpenModal(false);
      reset();
    } catch (error) {
      const mensajesError = error.errors.join(', ');
      toast.error(mensajesError || "Ocurrió un error", {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#333",
          color: "#fff",
        },
      });
      console.log(mensajesError)
      console.log('Valores enviados', data)
    }
  };

  // SUBMIT ACTUALIZAR
  const onsubmitActualizar = async (valores) => {
    if (usuarioSeleccionado) {
      try {
        // Asumiendo que actualizarUsuario es una función asíncrona
        const response = await actualizarUsuario({ data: valores, id: usuarioSeleccionado.id_usuario }).unwrap();
        
        // Se utiliza la respuesta del servidor para obtener el mensaje
        setsucessActualizar(response.message);
      
        toast.success(response.message, {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#333",
            color: "#fff",
          },
          icon: <FcOk />,
        });

        console.log('Valores enviados:', valores);
        setOpenModalActualizar(false);
        reset();
      } catch (error) {
        // Se maneja el error y se comprueba que `error.errors` exista
        const mensajesError = error.errors ? error.errors.join(', ') : "Ocurrió un error";
        toast.error(mensajesError, {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
        console.log(mensajesError);
        console.log('Valores enviados:', valores);
      }
    }
  };

  // ESTADO DE CARGA DE LA TABLA 
  if(isLoading){
    return(
      <Spinner className="flex justify-center items-center h-screen bg-gray-100" />
    )
  }

  const filtrodeDatos = data && data.length > 0 ? data.filter((usuario) => {
    const filtroestado = filtroEstado ? "activo" : "inactivo"
    const nombreUsuario = busqueda === "" ||
      (usuario.nombre && usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    const usuarioEstado = usuario.estado === filtroestado
    return usuarioEstado && nombreUsuario
  }) : []

  // CONTROL DE PAGINAS DE LA TABLA
  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const elementosActuales = filtrodeDatos.slice(indicePrimerItem,indiceUltimoItem);
  const totalPages = Math.ceil((filtrodeDatos?.length||0)/itemsPorPagina)

  //OPCIONES PARA LOS SELECT 
  const estadoOptions = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" }
  ];

  const documentoOptions = [
    { value: "cc", label: "cc" },
    { value: "ti", label: "ti" },
    { value: "nit", label: "nit" },
    { value: "pasaporte", label: "pasaporte" },
  ];
  
  return (
    <>
    <div className=" flex rounded-tl-xl flex-col gap-8 bg-gray-100 overflow-y-hidden">

    {/* TABLA */}
    <div className="flex pt-5 justify-center items-center ">
    <div>
      <Mybutton onClick={handleClick} color={"primary"}>{t("nuevoUsuario")} <IoPersonAddOutline /></Mybutton>
    </div>
    <div className="w-[550px] pl-20">
        <Search label={""} placeholder={t("buscar")} onchange={(e) => setBusqueda(e.target.value)} />
    </div>
    <div className="pl-20">
        <Switch
          color={filtroEstado ? "success" : "default"}
          isSelected={filtroEstado}
          onValueChange={(checked) =>setFiltroEstado(checked)}>
          {t("estado")}
        </Switch>
      </div>
    </div>

     {/* CARDS */}
     {dato && dato.usuariosPorRol && dato.usuariosPorRol.length > 0 ? (
    <div className="flex justify-center items-center gap-4 px-20 py-6">
    {/* Card Administrador */}
    <div className="bg-white rounded-lg shadow-md p-6 w-40 text-center">
    <h2 className="text-lg font-bold mb-2">{t("admin")}</h2>
      <input
        disabled
        type="text"
        className="w-full p-2 text-center  rounded-md"
        placeholder={dato.usuariosPorRol[0]?.total_usuarios || '0'}
      />
      <i className="bi bi-person-lock text-2xl"></i>
    </div>

    {/* Card Encargado */}
    <div className="bg-white rounded-lg shadow-md p-6 w-40 text-center">
    <h2 className="text-lg font-bold mb-2">{t("encargado")}</h2>
      <input
        disabled
        type="text"
        className="w-full p-2 text-center  rounded-md"
        placeholder={dato.usuariosPorRol[1]?.total_usuarios || '0'}
      />
      <i className="bi bi-person-check text-2xl"></i>
    </div>

    {/* Card Cliente */}
    <div className="bg-white rounded-lg shadow-md p-6 w-40 text-center">
    <h2 className="text-lg font-bold mb-2">{t("cliente")}</h2>
      <input
        disabled
        type="text"
        className="w-full p-2 text-center  rounded-md"
        placeholder={dato.usuariosPorRol[2]?.total_usuarios || '0'}
      />
      <i className="bi bi-person text-2xl"></i>
    </div>

    {/* Card Operario */}
    <div className="bg-white rounded-lg shadow-md p-6 w-40 text-center">
    <h2 className="text-lg font-bold mb-2">{t("operario")}</h2>
      <input
        disabled
        type="text"
        className="w-full p-2 text-center  rounded-md"
        placeholder={dato.usuariosPorRol[3]?.total_usuarios || '0'}
      />
      <i className="bi bi-person-gear text-2xl"></i>
    </div>

    {/* Card Total */}
    <div className="bg-white rounded-lg shadow-md p-6 w-40 text-center">
    <h2 className="text-lg font-bold mb-2">{t("total")}</h2>
      <input
        disabled
        type="text"
        className="w-full p-2 text-center  rounded-md"
        placeholder={dato?.total || '0'}
      />
      <i className="bi bi-people text-2xl"></i>
    </div>
    </div>
    ) : (
      <Spinner className="flex justify-center items-center h-screen bg-gray-100" />
    )}
    
    <div className="w-full px-20 h-auto ">
      <TableMolecula className="w-full">
        <Thead>
          <Th>ID</Th>
          <Th>{t("nombre")}</Th>
          <Th>{t("apellidos")}</Th>
          <Th>{t("correo")}</Th>
          <Th>{t("telefono")}</Th>
          <Th>{t("documento")}</Th>
          <Th>{t("tipo")}</Th>
          {/* <Th>Estado</Th> */}
          <Th>{t("rol")}</Th>
          <Th>{t("editar")}</Th>
          <Th>{t("estado")}</Th>
        </Thead>
        <Tbody>
          {elementosActuales.length>0?(
            elementosActuales.map((usuario)=>(
              <tr className="hover:bg-slate-200" key={usuario.id_usuario}>
                <Td>{usuario.id_usuario}</Td>
                <Td>{usuario.nombre}</Td>
                <Td>{usuario.apellidos}</Td>
                <Td>{usuario.correo_electronico}</Td>
                <Td>{usuario.telefono}</Td>
                <Td>{usuario.numero_documento}</Td>
                <Td>{usuario.tipo_documento}</Td>
                {/* <Td>{usuario.estado}</Td> */}
                <Td>{usuario.rol}</Td>
                <Td>
                <div className="flex justify-center items-center space-x-4">
                  
                <button
                  className="group bg-none flex cursor-pointer items-center justify-center h-[30px] w-[60px] rounded-[5px] border-none hover:rounded-full hover:bg-gray-400/30"
                  onClick={() => handleClickActualizar(usuario)}
                >
                <FaRegEdit/>
                </button>
                  {/* <Mybutton color={"primary"} onClick={() => handleClickActualizar(usuario)}>Actualizar</Mybutton> */}
                </div>
                </Td>
                <Td>
                  <CustomSwitch
                      setisSelected={usuario.estado === "activo"}
                      onChange={() => handleSwitchChange(usuario.id_usuario, usuario.nombre)}
                  />
                  {/* <Mybutton color={"danger"} onClick={() => eliminarUsuario(usuario.id_usuario)}> Eliminar </Mybutton> */}
                </Td>

              </tr>
            ))
          ):(
            <tr>
            <td colSpan={9} className="text-center">
              <h1 className="text-2xl">
                <b>No hay datos</b>
              </h1>
            </td>
          </tr>
          )
          }

        </Tbody>
      </TableMolecula>
    </div>
    <div className="flex justify-center mt-4 mb-5">
        <PaginationMolecula
        total={totalPages}
        initialPage={paginaActual}
        onChange={(pagina)=>setPaginaActual(pagina)}
        />
    </div>
    {/* FIN TABLA */}

    {/* MODAL REGISTRO*/}
    {openModal && (
          <ModalOrganismo
          logo={<Logosímbolo />}
          children={
            <UserFrom
              onsubmit={handleSubmit(onsubmit)}
              children={
                <>
                  <InputAtomo
                    register={register}
                    name={"nombre"}
                    erros={errors}
                    id={"nombre"}
                    placeholder={t("ingreseNombreUsuario")}
                    type={"text"}
                  />
                  <InputAtomo
                    register={register}
                    name={"apellidos"}
                    erros={errors}
                    id={"apellidos"}
                    placeholder={t("ingreseApellidoUsuario")}
                    type={"text"}
                  />
                  <InputAtomo
                    register={register}
                    name={"correo_electronico"}
                    erros={errors}
                    id={"correo_electronico"}
                    placeholder={t("ingreseCorreoUsuario")}
                    type={"text"}
                  />
                  <InputAtomo
                    register={register}
                    name={"telefono"}
                    erros={errors}
                    id={"telefono"}
                    placeholder={t("ingreseTelefonoUsuario")}
                    type={"number"}
                  />
                  <InputAtomo
                    register={register}
                    name={"password"}
                    erros={errors}
                    id={"password"}
                    placeholder={t("ingreseContrasenaUsuario")}
                    type={"password"}
                  />
                  <SelectAtomo
                    data={roles.map(role => ({ value: role.idRol, label: role.rol }))} // Mapeo de roles
                    label={t("rol")} 
                    onChange={(e) => setValue("rol", e.target.value)} 
                    items={"value"} 
                    ValueItem={"label"} 
                    value={watch("rol")} 
                  />
                  <SelectAtomo
                    data={documentoOptions} 
                    label={t("tipoDocumento")} 
                    onChange={(e) => setValue("tipo_documento", e.target.value)} 
                    items={"value"} 
                    ValueItem={"label"} 
                    value={watch("tipo_documento")} 
                  />
                  <InputAtomo
                    register={register}
                    name={"numero_documento"}
                    erros={errors}
                    id={"numero_documento"}
                    placeholder={t("ingreseNumeroIdentificacion")}
                    type={"number"}
                  />
                </>
              }
            />
          }
          visible={true}
          title={t("registroUsuarios")}
          closeModal={closeModal}
        />
        
    )}
    {/* FIN MODAL REGISTRO*/}

    {/* MODAL ACTUALIZAR*/}
    {openModalActualizar && (
    <ModalOrganismo
      // logo={<Logosímbolo />}
      children={
        <UserFrom
          onsubmit={handleSubmit(onsubmitActualizar)}
          children={
            <>
              <InputAtomoActualizar
                register={register}
                name={"nombre"}
                errores={errors}
                id={"nombre"}
                placeholder={t("ingreseNombreUsuario")}
                type={"text"}
                defaultValue={usuarioSeleccionado?.nombre || ""}
              />
              <InputAtomoActualizar
                register={register}
                name={"apellidos"}
                errores={errors}
                id={"apellidos"}
                placeholder={t("ingreseApellidoUsuario")}
                type={"text"}
                defaultValue={usuarioSeleccionado?.apellidos || ""}
              />
              <InputAtomoActualizar
                register={register}
                name={"correo_electronico"}
                errores={errors}
                id={"correo_electronico"}
                placeholder={t("ingreseCorreoUsuario")}
                type={"text"}
                defaultValue={usuarioSeleccionado?.correo_electronico || ""}
              />
              <InputAtomoActualizar
                register={register}
                name={"telefono"}
                errores={errors}
                id={"telefono"}
                placeholder={t("ingreseTelefonoUsuario")}
                type={"text"}
                defaultValue={usuarioSeleccionado?.telefono || ""}
              />
              {/* 
              <InputAtomoActualizar
                register={register}
                name={"password"}
                errores={errors}
                id={"password"}
                placeholder={"Ingrese la contraseña del usuario"}
                type={"password"}
                defaultValue={usuarioSeleccionado?.password || ""}
              /> */}

              <SelectAtomoActualizar
                data={roles.map(role => ({ value: role.idRol, label: role.rol }))}
                label={t("rol")} 
                items={"value"}
                onChange={(e) => setValue("fk_idRol", e.target.value)}
                placeholder={usuarioSeleccionado?.rol}
                value={usuarioSeleccionado?.fk_idRol || ""}
              />

              <SelectAtomoActualizar
                data={documentoOptions}
                label={t("tipoDocumento")} 
                items={"value"}
                placeholder={usuarioSeleccionado?.tipo_documento}
                onChange={(e) => setValue("tipo_documento", e.target.value)}
                value={usuarioSeleccionado?.tipo_documento || ""}
              />

              {/* <SelectAtomo
                data={estadoOptions}
                label={"Estado"}
                onChange={(e) => setValue("estado", e.target.value)}
                items={"value"}
                ValueItem={"label"}
                placeholder={usuarioSeleccionado?.estado}
                value={usuarioSeleccionado?.estado || ""}
              /> */}
                
              <InputAtomoActualizar
                register={register}
                name={"numero_documento"}
                errores={errors}
                id={"numero_documento"}
                placeholder={t("ingreseNumeroIdentificacion")}
                type={"number"}
                defaultValue={usuarioSeleccionado?.numero_documento || ""}
              />
            </>
          }
        />
      }
      visible={true}
      title={t("actualizarUsuario")}
      closeModal={closeModalActualizar}
    />

    )}
    {/* FIN MODAL ACTUALIZAR*/}
    </div>
    </>
  );
};

export default UsersPlantilla;
