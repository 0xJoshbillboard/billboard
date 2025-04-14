import { Outlet } from 'react-router';
import { Stack } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ onThemeChange }: { onThemeChange: () => void }) {
  return (
    <Stack direction="column" spacing={2} minHeight="100vh" justifyContent="space-between" alignItems="center">
      <Header toggleColorMode={onThemeChange} />
      <Outlet />
      <Footer />
    </Stack>
  );
}
