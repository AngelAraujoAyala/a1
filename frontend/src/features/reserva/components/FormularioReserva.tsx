import { useEffect, useState } from "react";

import PasoContacto from "./PasoContacto";
import PasoDatosEvento from "./PasoDatosEvento";
import PasoToppings from "./PasoToppings";
import ConfirmarReserva from "./ConfirmarReserva";

import { Button } from "../../../components/ui/Buttons";
import { Alert } from "../../../components/ui/Alert";

import { crearReservacion } from "../services/reservaService";
import { getPackages, type Package } from "../services/packageService";
import { getToppings, type Topping } from "../services/toppingService";

import type { Reserva } from "../../../interfaces/reserva";

interface BloqueoFecha {
  id: number;
  fecha: string;
  horaInicio?: string | null;
  horaFin?: string | null;
  motivo?: string;
}

type ErroresReserva = Partial<Record<keyof Reserva, string>>;

export const FormularioReserva = () => {
  const [datos, setDatos] = useState<Reserva>(() => {
    const guardado = localStorage.getItem("progreso_crujisnacks");

    if (guardado) {
      try {
        return JSON.parse(guardado);
      } catch (e) {
        console.error("Error recuperando datos guardados", e);
      }
    }

    return {
      nombreCliente: "",
      emailCliente: "",
      telefono: "",
      fechaInicio: "",
      fechaFin: "",
      lugar: "",
      packageId: null,
      toppingsIds: [],
    };
  });

  const [packages, setPackages] = useState<Package[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoFecha[]>([]);
  const [reservasExistentes, setReservasExistentes] = useState<Reserva[]>([]);
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<ErroresReserva>({});
  const [numeroTelefono, setNumeroTelefono] = useState("526624509876");

  const [enviado, setEnviado] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetch(`${API_URL}/auth/public-config`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.whatsappNumber) {
          setNumeroTelefono(data.whatsappNumber);
        }
      })
      .catch((err) =>
        console.error("Error obteniendo teléfono de notificaciones", err),
      );
  }, [API_URL]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesData, toppingsData, bloqueosRes, reservasRes] =
          await Promise.all([
            getPackages(),
            getToppings(),
            fetch(`${API_URL}/bloqueos`).then((res) => res.json()),
            fetch(`${API_URL}/reservations`).then((res) => res.json()),
          ]);

        setPackages(packagesData);
        setToppings(toppingsData.filter((t) => t.stock));
        setBloqueos(bloqueosRes);
        setReservasExistentes(reservasRes);
      } catch (error) {
        console.error("Error cargando datos de configuración inicial", error);
      }
    };

    fetchData();
  }, [API_URL]);

  useEffect(() => {
    if (!enviado) {
      localStorage.setItem("progreso_crujisnacks", JSON.stringify(datos));
    }
  }, [datos, enviado]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [paso, enviado]);

  const verificarFechaBloqueada = (fechaIsoString: string): boolean => {
    if (!fechaIsoString) return false;

    const [fechaElegida, horaElegida] = fechaIsoString.split("T");
    const horaElegidaLimpia = horaElegida ? horaElegida.slice(0, 5) : "";

    return bloqueos.some((bloqueo) => {
      const fechaBloqueoLimpia = bloqueo.fecha.split("T")[0];

      if (fechaBloqueoLimpia !== fechaElegida) return false;

      if (!bloqueo.horaInicio && !bloqueo.horaFin) {
        return true;
      }

      if (horaElegidaLimpia && bloqueo.horaInicio && bloqueo.horaFin) {
        const extraerHoraLimpia = (str: string) => {
          return str.includes("T")
            ? str.split("T")[1].slice(0, 5)
            : str.slice(0, 5);
        };

        const horaInicioBloqueo = extraerHoraLimpia(bloqueo.horaInicio);
        const horaFinBloqueo = extraerHoraLimpia(bloqueo.horaFin);

        return (
          horaElegidaLimpia >= horaInicioBloqueo &&
          horaElegidaLimpia <= horaFinBloqueo
        );
      }

      return false;
    });
  };

  const verificarCruceConReservas = (
    inicioElegido: string,
    finElegido: string,
  ): boolean => {
    if (!inicioElegido || !finElegido) return false;

    // Convertimos las entradas del formulario a timestamps (Maneja zona horaria local automáticamente)
    const startElegido = new Date(inicioElegido).getTime();
    const endElegido = new Date(finElegido).getTime();

    return reservasExistentes.some((reserva) => {
      const startExistente = new Date(reserva.fechaInicio).getTime();
      const endExistente = new Date(reserva.fechaFin).getTime();

      // Fórmula matemática de colisión de intervalos: (InicioA < FinB) && (FinA > InicioB)
      return startElegido < endExistente && endElegido > startExistente;
    });
  };

  // CONFIRMAR (Mejorado sin bloqueos de alert de JS nativo)
  const handleFinalConfirm = async () => {
    try {
      setLoading(true);
      setErrores({});

      await crearReservacion(datos);

      const selectedPackage = packages.find((p) => p.id === datos.packageId);
      const selectedToppings = toppings.filter((t) =>
        datos.toppingsIds.includes(t.id),
      );

      const mensaje = `*NUEVA RESERVA* 📋%0A
*Cliente:* ${datos.nombreCliente}%0A
*WhatsApp:* ${datos.telefono}%0A
*Email:* ${datos.emailCliente}%0A
*Inicio:* ${datos.fechaInicio}%0A
*Fin:* ${datos.fechaFin}%0A
*Ubicación:* ${datos.lugar}%0A
*Paquete:* ${selectedPackage?.nombre ?? "Sin paquete"}%0A
*Toppings:* ${selectedToppings.map((t) => t.nombre).join(", ")}%0A
--------------------------%0A
_Enviado desde el formulario web_`;

      const targetUrl = `https://wa.me/${numeroTelefono}?text=${mensaje}`;

      // Actualizamos estados para desmontar el formulario y renderizar el éxito
      setWhatsappUrl(targetUrl);
      setEnviado(true);
      localStorage.removeItem("progreso_crujisnacks");

      // Intentamos abrir la pestaña en segundo plano de forma no bloqueante
      window.open(targetUrl, "_blank");
    } catch (error) {
      console.error(error);
      // En vez de alert(), inyectamos el error directamente en la UI usando tus componentes estilizados
      setErrores({
        nombreCliente:
          "Hubo un problema al procesar tu solicitud con el servidor. Por favor, vuelve a intentarlo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const validarPasoActual = () => {
    const nuevosErrores: ErroresReserva = {};

    if (paso === 1) {
      if (!datos.nombreCliente.trim()) {
        nuevosErrores.nombreCliente = "El nombre es obligatorio";
      }

      if (datos.telefono.trim().replace(/\D/g, "").length !== 10) {
        nuevosErrores.telefono = "El teléfono debe tener 10 dígitos";
      }

      if (!datos.lugar.trim()) {
        nuevosErrores.lugar = "La ubicación es obligatoria";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailSanitizado = datos.emailCliente.trim();

      if (!emailSanitizado) {
        nuevosErrores.emailCliente = "El correo es obligatorio";
      } else if (!emailRegex.test(emailSanitizado)) {
        nuevosErrores.emailCliente = "Correo inválido";
      }
    }

    if (paso === 2) {
      if (!datos.fechaInicio) {
        nuevosErrores.fechaInicio = "Selecciona fecha inicio";
      }

      if (!datos.fechaFin) {
        nuevosErrores.fechaFin = "Selecciona fecha final";
      }

      if (!datos.packageId) {
        nuevosErrores.packageId = "Selecciona un paquete";
      }

      if (datos.fechaInicio && datos.fechaFin) {
        const inicio = new Date(datos.fechaInicio);
        const fin = new Date(datos.fechaFin);

        if (fin <= inicio) {
          nuevosErrores.fechaFin =
            "La fecha final debe ser posterior a la de inicio";
        }

        if (inicio < new Date()) {
          nuevosErrores.fechaInicio = "No puedes reservar en el pasado";
        }

        if (!nuevosErrores.fechaInicio && !nuevosErrores.fechaFin) {
          const inicioBloqueado = verificarFechaBloqueada(datos.fechaInicio);
          const finBloqueado = verificarFechaBloqueada(datos.fechaFin);
          const horarioOcupado = verificarCruceConReservas(
            datos.fechaInicio,
            datos.fechaFin,
          );

          if (inicioBloqueado || finBloqueado) {
            nuevosErrores.fechaInicio =
              "La fecha u hora seleccionada está bloqueada de forma manual en la agenda.";
          } else if (horarioOcupado) {
            // Se ejecuta si choca con otro evento real en producción
            nuevosErrores.fechaInicio =
              "¡Upps! Esas horas ya están ocupadas por otro evento agendado. Elige otro horario.";
          }
        }
      }
    }

    if (paso === 3) {
      if (datos.toppingsIds.length < 10) {
        nuevosErrores.toppingsIds = "Selecciona 10 toppings";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSiguiente = () => {
    if (paso === 4) return;

    if (validarPasoActual()) {
      setPaso(paso + 1);
    }
  };

  const manejarAtras = () => {
    if (paso === 1) return;

    setErrores({});
    setPaso(paso - 1);
  };

  const updateToppings = (nuevosToppings: number[]) => {
    setDatos((prev) => ({
      ...prev,
      toppingsIds: nuevosToppings,
    }));

    if (nuevosToppings.length === 10) {
      setErrores((prevErrors) => {
        const { ...rest } = prevErrors;
        return rest;
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
      <div className="bg-orange-500 p-6 text-white text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wider">
          CrujiSnacks
        </h2>
        <p className="text-orange-100 text-sm">
          {enviado
            ? "¡Todo listo para tu evento!"
            : "Estás a unos pasos de tu barra de snacks"}
        </p>
      </div>

      {/* CONTENT */}
      <div className="p-8">
        {enviado ? (
          <div className="text-center py-6 space-y-6 animate-fadeIn">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 shadow-inner">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide">
                ¡Reserva Completada!
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed px-2">
                Tu cotización ha sido registrada en nuestra base de datos
                correctamente.
              </p>
            </div>

            <div className="bg-orange-50/70 border border-orange-100/70 p-4 rounded-2xl text-xs text-orange-800 leading-relaxed text-left">
              💡 **Nota:** Se intentó abrir la ventana de chat automáticamente.
              Si los bloqueadores de ventanas emergentes de tu navegador
              detuvieron la acción, da clic en el botón inferior para finalizar
              la confirmación.
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => window.open(whatsappUrl, "_blank")}
                className="w-full shadow-lg shadow-orange-500/20 py-3.5 font-bold text-sm tracking-wide"
              >
                📱 Abrir Chat de WhatsApp
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`h-2 w-full mx-1 rounded-full transition-all duration-300 ${
                    paso >= num ? "bg-orange-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {paso === 1 && (
              <PasoContacto
                datos={datos}
                setDatos={setDatos}
                errores={errores}
              />
            )}
            {paso === 2 && (
              <PasoDatosEvento
                datos={datos}
                setDatos={setDatos}
                errores={errores}
              />
            )}
            {paso === 3 && (
              <PasoToppings
                toppings={toppings}
                selectedToppings={datos.toppingsIds}
                onChange={updateToppings}
              />
            )}
            {paso === 4 && (
              <ConfirmarReserva
                datos={datos}
                toppings={toppings}
                packages={packages}
                onBack={() => setPaso(3)}
                onConfirm={handleFinalConfirm}
              />
            )}

            <div className="my-4">
              {Object.values(errores).map(
                (error, index) =>
                  error && <Alert key={index} mensaje={error} tipo="error" />,
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <div>
                {paso > 1 && paso < 4 && (
                  <Button variant="atras" onClick={manejarAtras}>
                    Atrás
                  </Button>
                )}
              </div>

              <div>
                {paso < 4 && (
                  <Button onClick={manejarSiguiente} variant="primary">
                    {paso === 3 ? "Confirmar" : "Siguiente"}
                  </Button>
                )}
              </div>
            </div>

            {loading && (
              <div className="mt-4 text-center text-sm text-orange-600 font-medium animate-pulse">
                Procesando datos y agendando evento...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
