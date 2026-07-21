import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Entrar | Sonhos Literários"
        description="Entrar no clube de leitura"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
