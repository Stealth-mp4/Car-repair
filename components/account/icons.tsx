/**
 * components/account/icons.tsx — the few icons the account area needs that
 * neither components/ui/icons.tsx nor components/admin/icons.tsx already draws.
 * Same house style (24x24 viewBox, 1.5 stroke, currentColor, no library).
 * Everything already drawn elsewhere is re-exported, never redrawn.
 */
import type { SVGProps } from "react";

export {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  CheckCircleIcon,
  WrenchIcon,
  DollarIcon,
} from "@/components/ui/icons";

export {
  GridIcon,
  CardIcon,
  FileIcon,
  ArrowRightIcon,
  MenuIcon,
  CloseIcon,
  CarIcon,
} from "@/components/admin/icons";

type IconProps = SVGProps<SVGSVGElement>;
const base = "h-6 w-6";

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base}
      {...props}
    >
      {children}
    </svg>
  );
}





/** Sign out — door with an outgoing arrow. */
export const SignOutIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 8l-4 4 4 4" />
    <path d="M6 12h9" />
  </Svg>
);


/** Bell — the notifications block on Profile. */
export const BellRingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 15V10a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 15z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Svg>
);
