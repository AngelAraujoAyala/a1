import { useState, useRef } from "react";
import type { Topping } from "../../../interfaces/topping";
import crujiApi from "../../../services/crujiApi";

interface Props {
  topping: Topping;
  setTopping: (topping: Topping) => void;
  onClose: () => void;
  onSave: () => void;
  isCreating: boolean;
}

export const ToppingModal = ({
  topping,
  setTopping,
  onClose,
  onSave,
  isCreating,
}: Props) => {
  const [uploading, setUploading] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorLocal(null);

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await crujiApi.post<{ imageUrl: string }>(
        "/toppings/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setTopping({
        ...topping,
        iconURL: data.imageUrl,
      });
    } catch (error) {
      console.error(error);
      setErrorLocal(
        "No se pudo subir la imagen. Intenta con otro formato (PNG/JPG).",
      );
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 transform transition-all scale-100">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isCreating ? "Nuevo Topping" : "Editar Topping"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura los ingredientes extra para el menú.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* ALERTA DE ERROR */}
        {errorLocal && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700 animate-shake">
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorLocal}</span>
          </div>
        )}

        {/* FORMULARIO */}
        <div className="space-y-4">
          {/* CAMPO: NOMBRE */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nombre del Topping <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={topping.nombre}
              onChange={(e) =>
                setTopping({
                  ...topping,
                  nombre: e.target.value,
                })
              }
              placeholder="Ej. elote, papas del base..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 bg-slate-50/50 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 focus:bg-white placeholder:text-slate-400"
            />
          </div>

          {/* CAMPO: IMAGEN / ICONO (DISEÑO PREMIUM INTERACTIVO) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Miniatura / Icono
            </label>

            {/* Input oculto controlado por referencia */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Zona de Carga Clickable */}
            <div
              onClick={triggerFileSelect}
              className={`
                border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-35 relative overflow-hidden
                ${topping.iconURL ? "border-slate-200 bg-slate-50" : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-orange-400"}
                ${uploading ? "opacity-60 pointer-events-none" : ""}
              `}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="animate-spin h-6 w-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="text-xs text-slate-500 font-semibold">
                    Subiendo imagen...
                  </p>
                </div>
              ) : topping.iconURL ? (
                <div className="relative group w-full flex flex-col items-center justify-center gap-2">
                  <img
                    src={topping.iconURL}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-xl shadow-inner border border-slate-200"
                  />
                  <span className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                    Cambiar Imagen 🔄
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-1.5">
                  <div className="mx-auto w-10 h-10 bg-slate-200/70 text-slate-600 rounded-xl flex items-center justify-center text-lg">
                    📷
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Haz clic para seleccionar
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Formatos cuadrados recomendados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={uploading || !topping.nombre.trim()}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-sm shadow-orange-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
