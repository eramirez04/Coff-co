import React, { useContext, useState } from "react";
import {
  useGetTipoDocumentosQuery,
  useUpdateEstadoTipoDocumentoMutation
} from "../../../store/api/TipoDocumentos";
import TableMolecula from "../../molecules/table/TableMolecula";
import Tbody from "../../molecules/table/Tbody";
import Thead from "../../molecules/table/Thead";
import Th from "../../atoms/Th";
import Td from "../../atoms/Td";
import ModalOrganismo from "../../organismo/Modal/ModalOrganismo";
import { FaRegEdit } from "react-icons/fa";
import Mybutton from "../../atoms/Mybutton";
import TipoDocumentoFormulario from "../../molecules/Formulario/TipoDocumentoFormulario";
import PaginationMolecula from "../../molecules/pagination/PaginationMolecula";
import { Switch } from "@nextui-org/react";
import { AuthContext } from "../../../context/AuthContext";
import Search from "../../atoms/Search";

const TipoDocumentoPlantilla = () => {
  const [showModal, setShowModal] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [datosDelFormulario, setDatosDelFormulario] = useState(null);
  const [pages, setPages] = useState(1);
  const { authData } = useContext(AuthContext)
  const { data: dataTipoDocumentos, isLoading, isError, error } = useGetTipoDocumentosQuery();
  const [updateEstadoTipoDocumento] = useUpdateEstadoTipoDocumentoMutation();
  const rol = authData.usuario.rol
  const handleModal = () => {
    setShowModal(true);
  };

  const cantidad = 4;
  const final = pages * cantidad;
  const inicial = final - cantidad;
  const handlePageChange = (page) => {
    setPages(page);
  };
  const filtro = dataTipoDocumentos?.filter(
    (tipoDocumento) => {
      const nombreTipoDocumentoMatch =
        buscar === "" ||
        (tipoDocumento?.nombreDocumento &&
          tipoDocumento?.nombreDocumento.toLowerCase().includes(buscar.toLowerCase()));
      return nombreTipoDocumentoMatch;
    }
  )

  const numeroPagina = Math.ceil((filtro?.length || 0) / cantidad);
  const DataArrayPaginacion = filtro ? filtro.slice(inicial, final) : [];

  const handleEdit = (tipoDocumento) => {
    setDatosDelFormulario(tipoDocumento);
    setShowModal(true);
  };

  const closeModal = () => {
    setDatosDelFormulario(null);
    setShowModal(false);
  };

  const handleSwitchChange = async (checked, id) => {
    try {
      await updateEstadoTipoDocumento({
        id: id,
        estado: checked ? "activo" : "inactivo",
      });
    } catch (error) {
      console.error("Error al procesar la solicitud", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <section className="w-full mt-5 gap-4 flex flex-wrap flex-col">
      <h2 className="text-2xl px-20 font-bold">Tipo de Documento</h2>
      <div className="px-20">
        {
          rol === "administrador" &&
          (
            <>
              <Mybutton color="primary" onClick={handleModal}>
                Nuevo
              </Mybutton>
            </>
          )
        }
        <Search label={""} onchange={(e) => setBuscar(e.target.value)} placeholder={"Buscar..."} />

      </div>
      {showModal && (
        <ModalOrganismo
          title="Registrar Nuevo Tipo de Documento"
          visible={showModal}
          closeModal={closeModal}
        >
          <TipoDocumentoFormulario
            dataValue={datosDelFormulario}
            closeModal={closeModal}
          />
        </ModalOrganismo>
      )}
      <div className="w-full px-20 overflow-x-auto">
        <TableMolecula>
          <Thead>
            <Th>ID</Th>
            <Th>Nombre del Documento</Th>
            <Th>Estado</Th>
            <Th>{rol === "administrador" ? "Acciones" : ""}</Th>
          </Thead>
          <Tbody>
            {DataArrayPaginacion?.map((tipoDocumento) => (
              <tr key={tipoDocumento.idTipoDocumento}>
                <Td>{tipoDocumento.idTipoDocumento}</Td>
                <Td>{tipoDocumento.nombreDocumento}</Td>
                <Td>
                  <Switch
                    color={tipoDocumento.estado === "activo" ? "success" : "default"}
                    isSelected={tipoDocumento.estado === "activo"}
                    onValueChange={(checked) => handleSwitchChange(checked, tipoDocumento.idTipoDocumento)}
                  >
                    {tipoDocumento.estado}
                  </Switch>
                </Td>
                <Td>
                  <div className="gap-3 flex flex-graw">
                    {
                      rol === "administrador" && (
                        <>
                          <FaRegEdit
                            className="cursor-pointer"
                            size="30px"
                            onClick={() => handleEdit(tipoDocumento)}
                          />
                        </>
                      )
                    }

                  </div>
                </Td>
              </tr>
            ))}
          </Tbody>
        </TableMolecula>
      </div>
      <div className="flex justify-center mt-4">
        <PaginationMolecula
          total={numeroPagina}
          initialPage={pages}
          onChange={handlePageChange}
        />
      </div>
    </section>
  );
};

export default TipoDocumentoPlantilla;
