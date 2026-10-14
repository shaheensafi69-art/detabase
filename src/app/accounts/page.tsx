import { redirect } from 'next/navigation';

export default function AccountsPage() {
  redirect('/?tab=accounts');
}
