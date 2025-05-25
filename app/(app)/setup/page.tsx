// app/setup/page.tsx
import UserSettingForm from "@/components/user-settings/UserSettingForm";

export default function SetupPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">マーケティング設定</h1>
      <UserSettingForm />
    </div>
  );
}