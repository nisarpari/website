import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sauna & Steam Rooms | Home Wellness Solutions | Bella Bathwares',
  description: 'Transform your home into a wellness sanctuary with our premium saunas and steam rooms. Canadian hemlock saunas, advanced steam therapy, and professional-grade construction.',
  keywords: 'sauna, steam room, home spa, wellness, heat therapy, steam therapy, Canadian hemlock, infrared sauna',
};

export default function SaunaSteamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
