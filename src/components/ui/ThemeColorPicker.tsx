"use client";

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronDownIcon, CheckIcon, XIcon } from 'lucide-react';
import {
  type HexColor,
  hexToHsva,
  type HslaColor,
  hslaToHsva,
  type HsvaColor,
  hsvaToHex,
  hsvaToHsla,
  hsvaToHslString,
  hsvaToRgba,
  type RgbaColor,
  rgbaToHsva,
} from '@uiw/color-convert';
// @ts-ignore
import Hue from '@uiw/react-color-hue';
// @ts-ignore
import Saturation from '@uiw/react-color-saturation';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// --- 工具函数 (来自 lib/utils) ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Badge 组件 ---
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// --- Button 组件 ---
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

// --- Input 组件 ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

// --- Popover 组件 ---
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-[#111111] p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// --- Separator 组件 ---
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className)}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

// --- DropdownMenu 组件 ---
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-[#111111] p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

// --- ThemeColorPicker 组件 ---
type PopoverContentProps = React.ComponentProps<typeof PopoverContent>;

function getColorAsHsva(color: `#${string}` | HsvaColor | HslaColor | RgbaColor): HsvaColor {
  if (typeof color === 'string') {
    return hexToHsva(color);
  } else if ('h' in color && 's' in color && 'v' in color) {
    return color;
  } else if ('r' in color) {
    return rgbaToHsva(color);
  } else {
    return hslaToHsva(color);
  }
}

export type ColorPickerValue = {
  hex: `#${string}`;
  hsl: HslaColor;
  rgb: RgbaColor;
};

type ThemeColorPickerProps = {
  value?: `#${string}` | HsvaColor | HslaColor | RgbaColor;
  type?: 'hsl' | 'rgb' | 'hex';
  swatches?: HexColor[];
  hideContrastRatio?: boolean;
  hideDefaultSwatches?: boolean;
  className?: string;
  onValueChange?: (value: ColorPickerValue) => void;
  children?: React.ReactNode;
} & Omit<PopoverContentProps, 'onValueChange'>;

export function ThemeColorPicker({
  value,
  children,
  type = 'hsl',
  swatches = [],
  hideContrastRatio,
  hideDefaultSwatches,
  onValueChange,
  className,
  ...props
}: ThemeColorPickerProps) {
  const [colorType, setColorType] = React.useState(type);
  const [colorHsv, setColorHsv] = React.useState<HsvaColor>(
    value ? getColorAsHsva(value) : { h: 0, s: 0, v: 0, a: 1 },
  );

  const handleValueChange = (color: HsvaColor) => {
    onValueChange?.({
      hex: hsvaToHex(color) as `#${string}`,
      hsl: hsvaToHsla(color),
      rgb: hsvaToRgba(color),
    });
    setColorHsv(color);
  };

  React.useEffect(() => {
    if (value) {
      setColorHsv(getColorAsHsva(value));
    }
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn('w-[350px] p-0', className)}
        {...props}
        style={
          {
            '--selected-color': hsvaToHslString(colorHsv),
          } as React.CSSProperties
        }
      >
        <div className="space-y-2 p-4">
          <Saturation
            hsva={colorHsv}
            onChange={(newColor: any) => {
              handleValueChange({ ...colorHsv, ...newColor });
            }}
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '4/2',
              borderRadius: '0.3rem',
            }}
            className="border border-border"
          />
          <Hue
            hue={colorHsv.h}
            onChange={(newHue: any) => {
              handleValueChange({ ...colorHsv, ...newHue });
            }}
            className="[&>div:first-child]:overflow-hidden [&>div:first-child]:!rounded"
            style={
              {
                width: '100%',
                height: '0.9rem',
                borderRadius: '0.3rem',
                '--alpha-pointer-background-color': 'hsl(var(--foreground))',
              } as React.CSSProperties
            }
          />

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0 justify-between uppercase">
                  {colorType}
                  <ChevronDownIcon className="-me-1 ms-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked={colorType === 'hex'} onCheckedChange={() => setColorType('hex')}>
                  HEX
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={colorType === 'hsl'} onCheckedChange={() => setColorType('hsl')}>
                  HSL
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={colorType === 'rgb'} onCheckedChange={() => setColorType('rgb')}>
                  RGB
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex grow">
              {colorType === 'hsl' && (
                <ObjectColorInput
                  value={hsvaToHsla(colorHsv)}
                  label="hsl"
                  onValueChange={(value) => {
                    handleValueChange(hslaToHsva(value));
                  }}
                />
              )}
              {colorType === 'rgb' && (
                <ObjectColorInput
                  value={hsvaToRgba(colorHsv)}
                  label="rgb"
                  onValueChange={(value) => {
                    handleValueChange(rgbaToHsva(value));
                  }}
                />
              )}
              {colorType === 'hex' && (
                <Input
                  className="flex"
                  value={hsvaToHex(colorHsv)}
                  onChange={(e) => {
                    handleValueChange(hexToHsva(e.target.value as HexColor));
                  }}
                />
              )}
            </div>
          </div>
          {(swatches.length > 0 || !hideDefaultSwatches) && <Separator />}
          {!hideDefaultSwatches && (
            <div className="flex flex-wrap justify-start gap-2">
              {['#F8371A', '#F97C1B', '#FAC81C', '#3FD0B6', '#2CADF6', '#6462FC', ...swatches]
                .sort((a, b) => hexToHsva(a).h - hexToHsva(b).h)
                .map((color) => (
                  <button
                    type="button"
                    key={`${color}-swatch`}
                    style={
                      {
                        '--swatch-color': color,
                      } as React.CSSProperties
                    }
                    onClick={() => handleValueChange(hexToHsva(color))}
                    onKeyUp={(e) => (e.key === 'Enter' ? handleValueChange(hexToHsva(color)) : null)}
                    aria-label={`Set color to ${color}`}
                    className="size-5 cursor-pointer rounded bg-[var(--swatch-color)] ring-2 ring-[var(--swatch-color)00] ring-offset-1 ring-offset-background transition-all duration-100 hover:ring-[var(--swatch-color)]"
                  />
                ))}
            </div>
          )}
          {!hideContrastRatio && (
            <>
              <Separator />
              <ContrastRatio color={colorHsv} />
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type ContrastRatioProps = {
  color: HsvaColor;
};

function ContrastRatio({ color }: ContrastRatioProps) {
  const [darkModeContrastRatio, setDarkModeContrastValue] = React.useState(0);
  const [lightModeContrastValue, setLightModeContrastValue] = React.useState(0);

  React.useEffect(() => {
    const rgb = hsvaToRgba(color);

    const toSRGB = (c: number) => {
      const channel = c / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    };

    const r = toSRGB(rgb.r);
    const g = toSRGB(rgb.g);
    const b = toSRGB(rgb.b);

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    const darkModeRatio = (1.0 + 0.05) / (luminance + 0.05);
    const lightModeRatio = (luminance + 0.05) / 0.05;

    setDarkModeContrastValue(Number(darkModeRatio.toFixed(2)));
    setLightModeContrastValue(Number(lightModeRatio.toFixed(2)));
  }, [color]);

  const ValidationBadge = ({
    ratio,
    ratioLimit,
    className,
    children,
    ...props
  }: {
    ratio: number;
    ratioLimit: number;
  } & Omit<BadgeProps, 'variant'>) => (
    <Badge
      variant="outline"
      className={cn(
        'gap-2 rounded-full text-muted-foreground',
        ratio > ratioLimit && 'border-transparent bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
        className,
      )}
      {...props}
    >
      {ratio > 4.5 ? <CheckIcon size={16} /> : <XIcon size={16} />}
      {children}
    </Badge>
  );

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded bg-[var(--selected-color)]">
          <span className="font-medium text-black dark:text-white">A</span>
        </div>
        <div className="flex flex-col justify-between">
          <span className="whitespace-nowrap text-nowrap text-xs text-muted-foreground">Contrast Ratio</span>
          <span className="hidden text-sm dark:flex">{darkModeContrastRatio}</span>
          <span className="text-sm dark:hidden">{lightModeContrastValue}</span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1">
        <ValidationBadge className="dark:hidden" ratio={lightModeContrastValue} ratioLimit={4.5}>
          AA
        </ValidationBadge>
        <ValidationBadge className="dark:hidden" ratio={lightModeContrastValue} ratioLimit={7}>
          AAA
        </ValidationBadge>
        <ValidationBadge className="hidden dark:flex" ratio={darkModeContrastRatio} ratioLimit={4.5}>
          AA
        </ValidationBadge>
        <ValidationBadge className="hidden dark:flex" ratio={darkModeContrastRatio} ratioLimit={7}>
          AAA
        </ValidationBadge>
      </div>
    </div>
  );
}

type ObjectColorInputProps =
  | {
      label: 'hsl';
      value: HslaColor;
      onValueChange?: (value: HslaColor) => void;
    }
  | {
      label: 'rgb';
      value: RgbaColor;
      onValueChange?: (value: RgbaColor) => void;
    };

function ObjectColorInput({ value, label, onValueChange }: ObjectColorInputProps) {
  function handleChange(val: Partial<HslaColor> | Partial<RgbaColor>) {
    if (onValueChange) {
        onValueChange({ ...value, ...val } as any);
    }
  }
  return (
    <div className="-mt-px flex">
      <div className="relative min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-e-none shadow-none [direction:inherit]"
          value={label === 'hsl' ? value.h.toFixed(0) : value.r}
          onChange={(e) =>
            handleChange({
              [label === 'hsl' ? 'h' : 'r']: Number(e.target.value),
            })
          }
        />
      </div>
      <div className="relative -ms-px min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-none shadow-none [direction:inherit]"
          value={label === 'hsl' ? value.s.toFixed(0) : value.g}
          onChange={(e) =>
            handleChange({
              [label === 'hsl' ? 's' : 'g']: Number(e.target.value),
            })
          }
        />
      </div>
      <div className="relative -ms-px min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-s-none shadow-none [direction:inherit]"
          value={label === 'hsl' ? value.l.toFixed(0) : value.b}
          onChange={(e) =>
            handleChange({
              [label === 'hsl' ? 'l' : 'b']: Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  );
}
