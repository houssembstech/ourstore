// Root redirect to default locale
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/fr');
}
