import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function SignInForm() {
  const { showToast } = useToast();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      showToast(
        "success",
        "Login efetuado",
        "Bem-vindo(a)"
      );
      navigate("/dashboard");
    } catch (err) {
      showToast(
        "error",
        "Falha no login",
        "Credenciais inválidas"
      );
      setError("Email ou senha inválidos.");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ChevronLeftIcon className="size-5" />
          Voltar ao início
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-title-sm">
              Entrar
            </h1>
            <p className="text-sm text-gray-500">
              Informe o seu email e senha para entrar!
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-500">{error}</div>
          )}

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
                <Label>
                  Senha <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a sua senha"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <span className="text-sm text-gray-700">
                    Manter-me conectado
                  </span>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-500"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <div>
                <Button className="w-full" size="sm">
                  Entrar
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm text-gray-700">
              Ainda não tem uma conta?{" "}
              <Link
                to="/signup"
                className="text-brand-500"
              >
                Registar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
