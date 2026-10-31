import { redirect } from 'next/navigation';

export default function AddTransactionRedirect() {
  redirect('/transaction/create');
}
