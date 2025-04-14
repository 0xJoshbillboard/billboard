import { Container, Divider, Link, Stack, useTheme } from '@mui/material';
import { menuItems } from '../utils/links';

export default function Footer() {
  const theme = useTheme();
  return (
    <Container maxWidth={false}>
      <Stack direction="column" justifyContent="space-between" alignItems="center" maxWidth="1440px" margin="0 auto">
        <Divider sx={{ width: '100%', backgroundColor: theme.palette.primary.main }} />
        <Stack direction="row" spacing={2} p={4}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              variant="body1"
              component="a"
              href={item.path}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {item.text}
            </Link>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
