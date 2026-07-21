import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { apiRequest } from "../../api/client";
import PasswordChecklist from "../common/PasswordChecklist";
import { useToast } from "../../context/ToastContext";

export default function SignUpForm() {
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid =
    fullName &&
    email &&
    password &&
    password === confirmPassword &&
    inviteCode &&
    isChecked;

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await apiRequest("/auth/register/", "POST", {
        email,
        password,
        full_name: fullName,
        invite_code: inviteCode
      });

      showToast(
        "success",
        "Conta criada",
        "Já pode entrar com a sua conta"
      );
      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);

    } catch {
      showToast(
        "error",
        "Falha no cadastro",
        "Verifique os dados informados"
      );
      setError("Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Voltar ao início
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Registar
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Informe os seus dados e o código de convite para se registar!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* <!-- Full Name --> */}
                <div className="sm:col-span-1">
                  <Label>
                    Nome Completo<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Digite o seu nome completo"
                    value={fullName}
                    onChange={(e:any) => setFullName(e.target.value)}
                  />
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="Digite o seu email"
                    value={email}
                    onChange={(e:any) => setEmail(e.target.value)}
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Senha<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="Senha"
                      onChange={(e:any) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  <PasswordChecklist password={password} />
                </div>
                {/* <!-- Confirm Password --> */}
                <div>
                  <Label>
                    Confirmar Senha<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar Senha"
                      value={confirmPassword}
                      onChange={(e:any) => setConfirmPassword(e.target.value)}
                    />
                    <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>

                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      As senhas não coincidem
                    </p>
                  )}
                </div>
                {/* <!-- Invite Code --> */}
                <div>
                  <Label>
                    Código de Convite<span className="text-error-500">*</span>
                  </Label>

                  <Input
                    type="text"
                    placeholder="Código de Convite"
                    value={inviteCode}
                    onChange={(e:any) => setInviteCode(e.target.value)}
                  />
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    Ao criar uma conta você concorda com os nossos{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Termos e Condições
                    </span>{" "}
                    e a nossa{" "}
                    <span className="text-gray-800 dark:text-white">
                      Política de Privacidade
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
                  >
                    {loading ? "A criar conta…" : "Registar"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Já tem uma conta? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
