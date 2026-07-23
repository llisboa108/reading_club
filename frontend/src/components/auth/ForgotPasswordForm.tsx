import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { apiRequest } from "../../api/client";
import { useToast } from "../../context/ToastContext";

export default function ForgotPasswordForm() {
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiRequest("/auth/password-reset/", "POST", { email });
    } catch {
      // The backend always answers 200 for this endpoint; a network/other
      // error here still shouldn't reveal whether the email is registered.
    } finally {
      setSubmitting(false);
      setSent(true);
      showToast(
        "success",
        "Pedido enviado",
        "Se o e-mail existir, enviámos um link de redefinição de senha."
      );
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
              Esqueci minha senha
            </h1>
            <p className="font-ui text-sm text-gray-500 dark:text-gray-400">
              Informe o seu e-mail e enviaremos um link para redefinir a senha.
            </p>
          </div>

          {sent ? (
            <div className="rounded-lg bg-success-50 px-4 py-3 font-ui text-sm text-success-700 dark:bg-success-500/15 dark:text-success-400">
              Se o e-mail <strong>{email}</strong> existir na nossa base, um link de
              redefinição foi enviado. Verifique a caixa de entrada.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Button className="w-full" size="sm" disabled={submitting}>
                    {submitting ? "A enviar…" : "Enviar link"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
