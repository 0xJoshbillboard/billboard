import { Container, Divider, Link, Stack, useTheme } from "@mui/material";
import { menuItems } from "../utils/links";

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Link
      href={href}
      variant="body1"
      component="a"
      sx={{
        textDecoration: "none",
        color: "inherit",
        "&:hover": {
          color: theme.palette.primary.main,
        },
      }}
    >
      {children}
    </Link>
  );
};

export default function Footer() {
  const theme = useTheme();
  return (
    <Container maxWidth={false}>
      <Stack
        direction="column"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="1440px"
        margin="0 auto"
      >
        <Divider
          sx={{ width: "100%", backgroundColor: theme.palette.primary.main }}
        />
        <Stack direction="row">
          <Stack spacing={2} p={4}>
            <FooterLink href="https://github.com/0xJoshbillboard/billboard">
              Github
            </FooterLink>
            <FooterLink href="https://discord.gg/kh9nuJsf">Discord</FooterLink>
            <FooterLink href="https://explorer.gitcoin.co/#/projects/0x0cfb90b8837870617d38d784f81e75348fc78b57cc4eff3715ddf30ef2d6605c">
              Gitcoin
            </FooterLink>
          </Stack>
          <Stack direction="column" spacing={2} p={4}>
            {menuItems.map((item) => (
              <FooterLink key={item.path} href={item.path}>
                {item.text}
              </FooterLink>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
