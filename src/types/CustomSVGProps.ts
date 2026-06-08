import { SVGProps } from "react";

interface CustomSVGProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
}

export default CustomSVGProps;