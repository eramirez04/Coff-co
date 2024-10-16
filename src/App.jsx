import React, { useState, useEffect, useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { parseJwt } from "./utils/ProtectedRoute";
import { AuthContext } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from 'js-cookie';
import HomePages from "./pages/Home/HomePages";
import CalendarPages from "./pages/Calendar/CalendarPages";
import DocumentosPage from "./pages/documentos/DocumentosPage";
import AmbientesPage from "./pages/ambientes/AmbientesPage";
import PreciosPage from "./pages/precios/PreciosPage";
import UsersPages from "./pages/users/UsersPages";
import Perfil from "./pages/users/Perfil";
import Logos from "./pages/logos/LogosPage";
import ServicioPage from "./pages/servicios/ServicioPage";
import VariablePages from "./pages/variable/VariablePages";
import MuestrasPage from "./pages/muestras/MuestrasPage";
import TipoDocumentoPage from "./pages/tipoDocumento/tipoDocumentoPage";
import LoginPages from "./pages/login/LoginPages";
import FacturasPages from "./pages/Facturas/FacturasPages";
import TipoServicioPage from "./pages/tipoServicio/tipoServicioPage";
import ReportesPages from "./pages/reportes/ReportesPages";
import ProtectedRoute from "./utils/ProtectedRoute";
import RecuperarPasswordPage from "./pages/recuperarpassword/RecuperarPasswordPage";

const App = () => {
  const [sesionExistente, setSesionExistente] = useState(false);

  //ROL DE LA SESION
  //Uso del contexto de autentificacion para obtener el rol del usuario que inicio sesion y asi mismo asignar sus rutas
  const { authData } = useContext(AuthContext);
  const Rol = authData?.usuario.rol

  //ESTADO DE LA SESION
  // Esta constante se encargara de obtener el token y verificar su validez, guardara esto en sesionExistente y mas adelante en el enrutado dara acceso a unas rutas u otras dependiendo de la validez
  const estadoSesion = () => {
    const token = Cookies.get('Token');
    const SesionValida = token && parseJwt(token)?.exp * 1000 > Date.now();
    setSesionExistente(SesionValida);
  };

  //VERIFICAR ESTADO DE SESION
  //Este useEffect se encarga de verificar constantemente el estado de la sesion, junto con la cookie que resguarda al token, ya que esta llamndo a la funcion estadoSesion, esto es  para asegurar que el sistema sea accesible siempre y cuando haya una sesion valida, verificando esto cada segundo.
  useEffect(() => {
    estadoSesion(); 
    const handleEstado = () => {
      estadoSesion();
    };
    const interval = setInterval(handleEstado, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="dark"
      />

      <Routes>

        {/* RUTAS SI LA SESION NO ESTA INICIADA */}
        <Route>
          <Route path="/password" element={<RecuperarPasswordPage />} />
        </Route>
        {!sesionExistente && (
          <>
            <Route path="/*" element={<LoginPages />}></Route>
            {/* <Route path="/login" element={<LoginPages />}></Route> */}
          </>
        )}

        {/* RUTAS PROTEGIDAS (ESTADO DE SESION VERDADERO) */}
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/login" element={<Navigate to="/"/>} /> */}
          <Route path="/*" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePages />} />

          {/* RUTAS DEPENDIENDO DEL ROL */}

          {Rol === "administrador" && (
            <>
              <Route path="/users" element={<UsersPages />} />
              <Route path="/alquiler" element={<CalendarPages />} />
              <Route path="/documentos" element={<DocumentosPage />} />
              <Route path="/ambientes" element={<AmbientesPage />} />
              <Route path="/precios" element={<PreciosPage />} />
              <Route path="/servicios" element={<ServicioPage />} />
              <Route path="/variables" element={<VariablePages />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/logos" element={<Logos />} />
              <Route path="/facturas" element={<FacturasPages />} />
              <Route path="/muestras" element={<MuestrasPage />} />
              <Route path="/Tipodocumento" element={<TipoDocumentoPage />} />
              <Route path="/tiposervicio" element={<TipoServicioPage />} />
              <Route path="/reportes" element={<ReportesPages />} />
            </>
          )}

          {Rol === "encargado" && (
            <>
              <Route path="/documentos" element={<DocumentosPage />} />
              <Route path="/ambientes" element={<AmbientesPage />} />
              <Route path="/precios" element={<PreciosPage />} />
              <Route path="/alquiler" element={<CalendarPages />} />
              <Route path="/facturas" element={<FacturasPages />} />
              <Route path="/variables" element={<VariablePages />} />
              <Route path="/Tipodocumento" element={<TipoDocumentoPage />} />
              <Route path="/servicios" element={<ServicioPage />} />
              <Route path="/tiposervicio" element={<TipoServicioPage />} />
              <Route path="/muestras" element={<MuestrasPage />} />
              <Route path="/logos" element={<Logos />} />
              <Route path="/reportes" element={<ReportesPages />} />
              <Route path="/perfil" element={<Perfil />} />
            </>
          )}

          {Rol === "operario" && (
            <>
              <Route path="/documentos" element={<DocumentosPage />} />
              <Route path="/ambientes" element={<AmbientesPage />} />
              <Route path="/precios" element={<PreciosPage />} />
              <Route path="/servicios" element={<ServicioPage />} />
              <Route path="/users" element={<UsersPages />} />
              <Route path="/Tipodocumento" element={<TipoDocumentoPage />} />
              <Route path="/tiposervicio" element={<TipoServicioPage />} />
              <Route path="/muestras" element={<MuestrasPage />} />
              <Route path="/logos" element={<Logos />} />
              <Route path="/variables" element={<VariablePages />} />
              <Route path="/perfil" element={<Perfil />} />
            </>
          )}

          {Rol === "cliente" && (
            <>
              <Route path="/*" element={<Navigate to="/home" />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/logos" element={<Logos />} />
            </>
          )}

        </Route>
      </Routes>
    </>
  );
};

export default App;
