import React, { useState } from "react";
import Mybutton from "../../atoms/Mybutton";
import TableMolecula from "../../molecules/table/TableMolecula";
import Thead from "../../molecules/table/Thead";
import Th from "../../atoms/Th";
import Tbody from "../../molecules/table/Tbody";
import Td from "../../atoms/Td";
import { FaRegEdit } from "react-icons/fa";
import {
  useActualizarAmbienteMutation,
  useCrearAmbienteMutation,
  useEliminarAmbienteMutation,
  useGetAmbientesQuery,
} from "../../../store/api/ambientes/ambientesSlice";
import { MdDelete } from "react-icons/md";
import ModalOrganismo from "../../organismo/Modal/ModalOrganismo";
import { Spinner, Switch } from "@nextui-org/react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import PaginationMolecula from "../../molecules/pagination/PaginationMolecula";
import { useForm } from "react-hook-form";
import ToolTip from "../../molecules/toolTip/ToolTip";
import InputAtomo from "../../atoms/Input";


const AmbientesPlantilla = () => {
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 4;

  const { data, isLoading, refetch } = useGetAmbientesQuery();
  const [crearAmbiente] = useCrearAmbienteMutation();
  const [actualizarAmbiente] = useActualizarAmbienteMutation();
  const [eliminarAmbiente] = useEliminarAmbienteMutation();

  const [visible, setVisible] = useState(false);
  const [ambienteSeleccionado, setAmbienteSeleccionado] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  if (isLoading) {
    return (
      <Spinner className="flex justify-center items-center h-screen bg-gray-100" />
    );
  }

  const abrirModal = (ambiente) => {
    if (ambiente) {
      setAmbienteSeleccionado(ambiente);
      reset({
        nombre_ambiente: ambiente.nombre_ambiente,
        estado: ambiente.estado,
      });
    } else {
      setAmbienteSeleccionado(null);
      reset({
        nombre_ambiente: "",
        estado: "activo",
      });
    }
    setVisible(true);
  };

  const cerrarModal = () => {
    setVisible(false);
    reset();
  };

  const onSubmit = async (datos) => {
    try {
      const payload = {
        nombre_ambiente: datos.nombre_ambiente,
        estado: "activo",
      };

      if (ambienteSeleccionado) {
        await actualizarAmbiente({
          id: ambienteSeleccionado.idAmbiente,
          ...payload,
        }).unwrap();
        toast.success("Ambiente actualizado con éxito");
      } else {
        await crearAmbiente(payload).unwrap();
        toast.success("Ambiente registrado con éxito");
      }

      cerrarModal();
      refetch();
    } catch (error) {
      console.error("Error al procesar la solicitud", error);
      toast.error("Error al procesar la solicitud");
    }
  };

  const handleSwitchChange = (checked, id) => {
    const nuevoEstado = checked ? "activo" : "inactivo";
    const ambienteActual = data.find((ambiente) => ambiente.idAmbiente === id);

    if (!ambienteActual) {
      toast.error("Ambiente no encontrado");
      return;
    }

    const payload = {
      id: id,
      nombre_ambiente: ambienteActual.nombre_ambiente,
      estado: nuevoEstado,
    };

    actualizarAmbiente(payload)
      .unwrap()
      .then(() => {
        toast.success("Estado del ambiente actualizado con éxito");
        refetch();
      })
      .catch((error) => {
        console.error("Error al actualizar el estado del ambiente", error);
        toast.error("Error al actualizar el estado del ambiente");
      });
  };

  const handleEliminarAmbiente = (id, nombre_ambiente) => {
    confirmAlert({
      title: (
        <div>
          <span>
            <b>Confirmación de eliminación</b>
          </span>
        </div>
      ),
      message: (
        <div>
          ¿Estás seguro de que quieres eliminar el ambiente
          <span style={{ color: "red", fontWeight: "bold" }}>
            {" "}
            {nombre_ambiente}
          </span>
          ?
        </div>
      ),
      buttons: [
        {
          label: "Sí",
          onClick: async () => {
            try {
              await eliminarAmbiente(id).unwrap();
              toast.success("Ambiente eliminado con éxito");
              refetch();
            } catch (error) {
              console.error("Error al eliminar el ambiente", error);
              toast.error("Error al eliminar el ambiente");
            }
          },
        },
        {
          label: "No",
          onClick: () => toast.info("Eliminación cancelada"),
        },
      ],
      closeOnClickOutside: true,
    });
  };

  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const currentItems = data
    ? data.slice(indicePrimerItem, indiceUltimoItem)
    : [];
  const totalPages = Math.ceil((data?.length || 0) / itemsPorPagina);

  return (
    <>
      <div className="w-auto h-screen flex flex-col gap-8 bg-gray-100">
        <div className="pt-10 pl-20">
          <Mybutton color={"primary"} onClick={() => abrirModal(null)}>
            <b>Nuevo Ambiente</b>
          </Mybutton>
        </div>
        <div className="w-full px-20 h-auto overflow-y-auto">
          <TableMolecula>
            <Thead>
              <Th>ID</Th>
              <Th>Nombre ambiente</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Thead>
            <Tbody>
              {currentItems.length > 0 ? (
                currentItems.map((ambiente) => (
                  <tr className="hover:bg-slate-200" key={ambiente.idAmbiente}>
                    <Td>{ambiente.idAmbiente}</Td>
                    <Td>{ambiente.nombre_ambiente}</Td>
                    <Td>
                      <Switch
                        color={
                          ambiente.estado === "activo" ? "success" : "default"
                        }
                        isSelected={ambiente.estado === "activo"}
                        onValueChange={(checked) =>
                          handleSwitchChange(checked, ambiente.idAmbiente)
                        }
                      >
                        {ambiente.estado}
                      </Switch>
                    </Td>
                    <Td>
                      <div className="flex flex-row gap-6">
                        <ToolTip
                          content="Eliminar"
                          placement="left"
                          icon={() => (
                            <MdDelete
                              size={"35px"}
                              onClick={() =>
                                handleEliminarAmbiente(
                                  ambiente.idAmbiente,
                                  ambiente.nombre_ambiente
                                )
                              }
                              className="cursor-pointer transform hover:scale-y-110 hover:scale-x-110 transition duration-300"
                            />
                          )}
                        />
                        <ToolTip
                          content="Actualizar"
                          placement="right"
                          icon={() => (
                            <FaRegEdit
                              size={"35px"}
                              onClick={() => abrirModal(ambiente)}
                              className="cursor-pointer transform hover:scale-y-110 hover:scale-x-110 transition duration-300"
                            />
                          )}
                        />
                      </div>
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">
                    <h1 className="text-2xl">
                      <b>No hay datos</b>
                    </h1>
                  </td>
                </tr>
              )}
            </Tbody>
          </TableMolecula>
        </div>

        <div className="flex justify-center mt-4">
          <PaginationMolecula
            total={totalPages}
            initialPage={paginaActual}
            onChange={(pagina) => setPaginaActual(pagina)}
          />
        </div>
      </div>
      <div className="flex">
        <ModalOrganismo
          visible={visible}
          closeModal={cerrarModal}
          onSubmit={handleSubmit(onSubmit)}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">
              {ambienteSeleccionado ? "Actualizar ambiente" : "Nuevo ambiente"}
            </h2>
            <div className="w-full max-w-xs">
              <InputAtomo
                type="text"
                id="nombre_ambiente"
                name="nombre_ambiente"
                placeholder="Nombre del ambiente"
                register={register}
                erros={errors}
              />
            </div>
            <div className="flex justify-center mt-6">
              <Mybutton type="submit" color="primary">
                {ambienteSeleccionado ? "Actualizar" : "Registrar"}
              </Mybutton>
            </div>
          </form>
        </ModalOrganismo>
      </div>
    </>
  );
};

export default AmbientesPlantilla;
