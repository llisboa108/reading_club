import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { apiRequest } from "../../api/client";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { usePasswordValidation } from "../../hooks/usePasswordValidation";
import PasswordChecklist from "../common/PasswordChecklist";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    isValid: isPasswordValid,
    errors,
    checking
  } = usePasswordValidation(newPassword);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const isFormValid =
    isPasswordValid &&
    confirmPassword.length > 0 &&
    confirmPassword === newPassword;

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/auth/change-password/", "PATCH", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setSuccess("Senha atualizada com sucesso.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch {
      setError("Não foi possível atualizar a senha. Verifique a senha atual.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="rounded-2xl bg-white p-6 dark:bg-gray-900">
        <h3 className="text-lg text-gray-800 dark:text-white font-semibold mb-5">
          Alterar Senha
        </h3>

        <div className="space-y-4">
          <div>
            <Label>Senha Atual</Label>
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e: any) => setOldPassword(e.target.value)}
              />
              <span
                onClick={() => setShowOld(!showOld)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showOld ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
          </div>

          <div>
            <Label>Nova Senha</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e: any) => setNewPassword(e.target.value)}
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showNew ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
            <PasswordChecklist password={newPassword} />
          </div>

          <div>
            <Label>Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showConfirm ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                As senhas não coincidem
              </p>
            )}

            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-xs text-green-500 mt-1">
                ✓ Senhas coincidem
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {success && (
            <p className="text-green-500 text-sm">{success}</p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={loading || !isFormValid}
            >
              {loading ? "Atualizando…" : "Atualizar Senha"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
