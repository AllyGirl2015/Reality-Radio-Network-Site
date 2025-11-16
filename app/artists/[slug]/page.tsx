import { redirect } from 'next/navigation';

export default function ArtistSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/talents/${params.slug}`);
}
