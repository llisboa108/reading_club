import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import { useModal } from "../hooks/useModal";
import ChangePasswordModal from "../components/UserProfile/ChangePasswordModal";

export default function UserProfiles() {
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <button
            onClick={openModal}
            className="mb-4 px-4 py-2 rounded-lg border text-gray-800 dark:text-white/90 text-sm"
          >
            Change Password
          </button>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isOpen}
        onClose={closeModal}
      />
    </>
  );
}
