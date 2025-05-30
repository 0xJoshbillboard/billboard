import {
  Box,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { menuItems } from "../utils/links";
import BillboardIcon from "./Icons/Billboard";

const FooterLink = ({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) => {
  const theme = useTheme();
  return (
    <Link
      href={href}
      variant="body1"
      component="a"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      sx={{
        textDecoration: "none",
        color: "inherit",
        transition: "color 0.2s ease-in-out",
        fontWeight: 500,
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
    <Box
      component="footer"
      sx={{
        width: "100%",
        maxWidth: "1440px",
        paddingY: 4,
        marginTop: "auto",
      }}
    >
      <Container maxWidth={false}>
        <Stack
          direction="column"
          alignItems="center"
          maxWidth="1440px"
          margin="0 auto"
          spacing={4}
        >
          <Divider
            sx={{
              width: "100%",
              backgroundColor: theme.palette.primary.main,
              height: "2px",
              opacity: 0.7,
            }}
          />

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-evenly"
            alignItems={{ xs: "center", md: "flex-start" }}
            width="100%"
            spacing={4}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <BillboardIcon />
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 4, sm: 8 }}
            >
              <Stack
                spacing={2}
                alignItems={{ xs: "center", md: "flex-start" }}
              >
                <Typography
                  variant="body1"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  Dev
                </Typography>
                <FooterLink
                  href="https://app.gitbook.com/o/s9b1HIS6RFGC7VZo3JJL/s/zG7RGFguim2oLxZaaBT4/"
                  external
                >
                  Docs
                </FooterLink>
              </Stack>
              <Stack
                spacing={2}
                alignItems={{ xs: "center", md: "flex-start" }}
              >
                <Typography
                  variant="body1"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  Community
                </Typography>
                <FooterLink href="https://github.com/0xJoshbillboard/billboard">
                  Github
                </FooterLink>
                <FooterLink href="https://discord.com/invite/RTv6fdHr">
                  Discord
                </FooterLink>
                <FooterLink href="https://explorer.gitcoin.co/#/projects/0x0cfb90b8837870617d38d784f81e75348fc78b57cc4eff3715ddf30ef2d6605c">
                  Gitcoin
                </FooterLink>
                <FooterLink href="https://x.com/0xJoshbillboard">X</FooterLink>
                <FooterLink href="mailto:0xJoshbillboard@gmail.com">
                  Email
                </FooterLink>
              </Stack>

              <Stack
                spacing={2}
                alignItems={{ xs: "center", md: "flex-start" }}
              >
                <Typography
                  variant="body1"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  Navigation
                </Typography>
                {menuItems
                  .filter((item) => !item.external)
                  .map((item) => (
                    <FooterLink key={item.path} href={item.path}>
                      {item.text}
                    </FooterLink>
                  ))}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
