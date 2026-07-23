import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { apiRequest } from "../../api/client";
import { useToast } from "../../context/ToastContext";

export default function ResetPasswordForm() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const linkIsValid = !!uid && !!token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/auth/password-reset-confirm/", "POST", {
        uid,
        token,
        new_password: newPassword,
      });
      showToast("success", "Senha redefinida", "Já pode entrar com a nova senha.");
      navigate("/signin");
    } catch (err: any) {
      showToast("error", "Erro", "Não foi possível redefinir a senha.");
      setError(
        err?.message || "Link inválido ou expirado. Peça um novo link."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/signin"
          className="inline-flex items-center font-ui text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Voltar ao login
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-heading text-gray-800 dark:text-white/90 text-title-sm">
              Redefinir senha
            </h1>
            <p className="font-ui text-sm text-gray-500 dark:text-gray-400">
              Escolha uma nova senha para a sua conta.
            </p>
          </div>

          {!linkIsValid ? (
            <div className="rounded-lg bg-error-50 px-4 py-3 font-ui text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              Link inválido.{" "}
              <Link to="/forgot-password" className="underline">
                Peça um novo link de redefinição
              </Link>
              .
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 font-ui text-sm text-red-500">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Nova senha <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite a nova senha"
                        value={newPassword}
                        onChange={(e: any) => setNewPassword(e.target.value)}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="size-5" />
                        ) : (
                          <EyeCloseIcon className="size-5" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>
                      Confirmar senha <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e: any) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <Button className="w-full" size="sm" disabled={submitting}>
                      {submitting ? "A guardar…" : "Redefinir senha"}
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
