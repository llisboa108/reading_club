import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Registar | Sonhos Literários"
        description="Criar conta no clube de leitura"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
