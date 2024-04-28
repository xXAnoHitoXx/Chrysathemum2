const text_color : Record<string, string> = {
	slate300: "text-slate-300", slate400: "text-slate-400", slate500: "text-slate-500", slate600: "text-slate-600", slate700: "text-slate-700", slate800: "text-slate-800", slate900: "text-slate-900", slate950: "text-slate-950",
	gray300: "text-gray-300", gray400: "text-gray-400", gray500: "text-gray-500", gray600: "text-gray-600", gray700: "text-gray-700", gray800: "text-gray-800", gray900: "text-gray-900", gray950: "text-gray-950",
	zinc300: "text-zinc-300", zinc400: "text-zinc-400", zinc500: "text-zinc-500", zinc600: "text-zinc-600", zinc700: "text-zinc-700", zinc800: "text-zinc-800", zinc900: "text-zinc-900", zinc950: "text-zinc-950",
	neutral300: "text-neutral-300", neutral400: "text-neutral-400", neutral500: "text-neutral-500", neutral600: "text-neutral-600", neutral700: "text-neutral-700", neutral800: "text-neutral-800", neutral900: "text-neutral-900", neutral950: "text-neutral-950",
	stone300: "text-stone-300", stone400: "text-stone-400", stone500: "text-stone-500", stone600: "text-stone-600", stone700: "text-stone-700", stone800: "text-stone-800", stone900: "text-stone-900", stone950: "text-stone-950",
	red300: "text-red-300", red400: "text-red-400", red500: "text-red-500", red600: "text-red-600", red700: "text-red-700", red800: "text-red-800", red900: "text-red-900", red950: "text-red-950",
	orange300: "text-orange-300", orange400: "text-orange-400", orange500: "text-orange-500", orange600: "text-orange-600", orange700: "text-orange-700", orange800: "text-orange-800", orange900: "text-orange-900", orange950: "text-orange-950",
	amber300: "text-amber-300", amber400: "text-amber-400", amber500: "text-amber-500", amber600: "text-amber-600", amber700: "text-amber-700", amber800: "text-amber-800", amber900: "text-amber-900", amber950: "text-amber-950",
	yellow300: "text-yellow-300", yellow400: "text-yellow-400", yellow500: "text-yellow-500", yellow600: "text-yellow-600", yellow700: "text-yellow-700", yellow800: "text-yellow-800", yellow900: "text-yellow-900", yellow950: "text-yellow-950",
	lime300: "text-lime-300", lime400: "text-lime-400", lime500: "text-lime-500", lime600: "text-lime-600", lime700: "text-lime-700", lime800: "text-lime-800", lime900: "text-lime-900", lime950: "text-lime-950",
	green300: "text-green-300", green400: "text-green-400", green500: "text-green-500", green600: "text-green-600", green700: "text-green-700", green800: "text-green-800", green900: "text-green-900", green950: "text-green-950",
	emerald300: "text-emerald-300", emerald400: "text-emerald-400", emerald500: "text-emerald-500", emerald600: "text-emerald-600", emerald700: "text-emerald-700", emerald800: "text-emerald-800", emerald900: "text-emerald-900", emerald950: "text-emerald-950",
	teal300: "text-teal-300", teal400: "text-teal-400", teal500: "text-teal-500", teal600: "text-teal-600", teal700: "text-teal-700", teal800: "text-teal-800", teal900: "text-teal-900", teal950: "text-teal-950",
	cyan300: "text-cyan-300", cyan400: "text-cyan-400", cyan500: "text-cyan-500", cyan600: "text-cyan-600", cyan700: "text-cyan-700", cyan800: "text-cyan-800", cyan900: "text-cyan-900", cyan950: "text-cyan-950",
	sky300: "text-sky-300", sky400: "text-sky-400", sky500: "text-sky-500", sky600: "text-sky-600", sky700: "text-sky-700", sky800: "text-sky-800", sky900: "text-sky-900", sky950: "text-sky-950",
	blue300: "text-blue-300", blue400: "text-blue-400", blue500: "text-blue-500", blue600: "text-blue-600", blue700: "text-blue-700", blue800: "text-blue-800", blue900: "text-blue-900", blue950: "text-blue-950",
	indigo300: "text-indigo-300", indigo400: "text-indigo-400", indigo500: "text-indigo-500", indigo600: "text-indigo-600", indigo700: "text-indigo-700", indigo800: "text-indigo-800", indigo900: "text-indigo-900", indigo950: "text-indigo-950",
	violet300: "text-violet-300", violet400: "text-violet-400", violet500: "text-violet-500", violet600: "text-violet-600", violet700: "text-violet-700", violet800: "text-violet-800", violet900: "text-violet-900", violet950: "text-violet-950",
	purple300: "text-purple-300", purple400: "text-purple-400", purple500: "text-purple-500", purple600: "text-purple-600", purple700: "text-purple-700", purple800: "text-purple-800", purple900: "text-purple-900", purple950: "text-purple-950",
	fuchsia300: "text-fuchsia-300", fuchsia400: "text-fuchsia-400", fuchsia500: "text-fuchsia-500", fuchsia600: "text-fuchsia-600", fuchsia700: "text-fuchsia-700", fuchsia800: "text-fuchsia-800", fuchsia900: "text-fuchsia-900", fuchsia950: "text-fuchsia-950",
	pink300: "text-pink-300", pink400: "text-pink-400", pink500: "text-pink-500", pink600: "text-pink-600", pink700: "text-pink-700", pink800: "text-pink-800", pink900: "text-pink-900", pink950: "text-pink-950",
	rose300: "text-rose-300", rose400: "text-rose-400", rose500: "text-rose-500", rose600: "text-rose-600", rose700: "text-rose-700", rose800: "text-rose-800", rose900: "text-rose-900", rose950: "text-rose-950",
};

export function get_text_color(color: string) : string {
    return text_color[color] ?? "text-sky-300";
}

const bg_color : Record<string, string> = {
	slate300: "bg-slate-300", slate400: "bg-slate-400", slate500: "bg-slate-500", slate600: "bg-slate-600", slate700: "bg-slate-700", slate800: "bg-slate-800", slate900: "bg-slate-900", slate950: "bg-slate-950",
	gray300: "bg-gray-300", gray400: "bg-gray-400", gray500: "bg-gray-500", gray600: "bg-gray-600", gray700: "bg-gray-700", gray800: "bg-gray-800", gray900: "bg-gray-900", gray950: "bg-gray-950",
	zinc300: "bg-zinc-300", zinc400: "bg-zinc-400", zinc500: "bg-zinc-500", zinc600: "bg-zinc-600", zinc700: "bg-zinc-700", zinc800: "bg-zinc-800", zinc900: "bg-zinc-900", zinc950: "bg-zinc-950",
	neutral300: "bg-neutral-300", neutral400: "bg-neutral-400", neutral500: "bg-neutral-500", neutral600: "bg-neutral-600", neutral700: "bg-neutral-700", neutral800: "bg-neutral-800", neutral900: "bg-neutral-900", neutral950: "bg-neutral-950",
	stone300: "bg-stone-300", stone400: "bg-stone-400", stone500: "bg-stone-500", stone600: "bg-stone-600", stone700: "bg-stone-700", stone800: "bg-stone-800", stone900: "bg-stone-900", stone950: "bg-stone-950",
	red300: "bg-red-300", red400: "bg-red-400", red500: "bg-red-500", red600: "bg-red-600", red700: "bg-red-700", red800: "bg-red-800", red900: "bg-red-900", red950: "bg-red-950",
	orange300: "bg-orange-300", orange400: "bg-orange-400", orange500: "bg-orange-500", orange600: "bg-orange-600", orange700: "bg-orange-700", orange800: "bg-orange-800", orange900: "bg-orange-900", orange950: "bg-orange-950",
	amber300: "bg-amber-300", amber400: "bg-amber-400", amber500: "bg-amber-500", amber600: "bg-amber-600", amber700: "bg-amber-700", amber800: "bg-amber-800", amber900: "bg-amber-900", amber950: "bg-amber-950",
	yellow300: "bg-yellow-300", yellow400: "bg-yellow-400", yellow500: "bg-yellow-500", yellow600: "bg-yellow-600", yellow700: "bg-yellow-700", yellow800: "bg-yellow-800", yellow900: "bg-yellow-900", yellow950: "bg-yellow-950",
	lime300: "bg-lime-300", lime400: "bg-lime-400", lime500: "bg-lime-500", lime600: "bg-lime-600", lime700: "bg-lime-700", lime800: "bg-lime-800", lime900: "bg-lime-900", lime950: "bg-lime-950",
	green300: "bg-green-300", green400: "bg-green-400", green500: "bg-green-500", green600: "bg-green-600", green700: "bg-green-700", green800: "bg-green-800", green900: "bg-green-900", green950: "bg-green-950",
	emerald300: "bg-emerald-300", emerald400: "bg-emerald-400", emerald500: "bg-emerald-500", emerald600: "bg-emerald-600", emerald700: "bg-emerald-700", emerald800: "bg-emerald-800", emerald900: "bg-emerald-900", emerald950: "bg-emerald-950",
	teal300: "bg-teal-300", teal400: "bg-teal-400", teal500: "bg-teal-500", teal600: "bg-teal-600", teal700: "bg-teal-700", teal800: "bg-teal-800", teal900: "bg-teal-900", teal950: "bg-teal-950",
	cyan300: "bg-cyan-300", cyan400: "bg-cyan-400", cyan500: "bg-cyan-500", cyan600: "bg-cyan-600", cyan700: "bg-cyan-700", cyan800: "bg-cyan-800", cyan900: "bg-cyan-900", cyan950: "bg-cyan-950",
	sky300: "bg-sky-300", sky400: "bg-sky-400", sky500: "bg-sky-500", sky600: "bg-sky-600", sky700: "bg-sky-700", sky800: "bg-sky-800", sky900: "bg-sky-900", sky950: "bg-sky-950",
	blue300: "bg-blue-300", blue400: "bg-blue-400", blue500: "bg-blue-500", blue600: "bg-blue-600", blue700: "bg-blue-700", blue800: "bg-blue-800", blue900: "bg-blue-900", blue950: "bg-blue-950",
	indigo300: "bg-indigo-300", indigo400: "bg-indigo-400", indigo500: "bg-indigo-500", indigo600: "bg-indigo-600", indigo700: "bg-indigo-700", indigo800: "bg-indigo-800", indigo900: "bg-indigo-900", indigo950: "bg-indigo-950",
	violet300: "bg-violet-300", violet400: "bg-violet-400", violet500: "bg-violet-500", violet600: "bg-violet-600", violet700: "bg-violet-700", violet800: "bg-violet-800", violet900: "bg-violet-900", violet950: "bg-violet-950",
	purple300: "bg-purple-300", purple400: "bg-purple-400", purple500: "bg-purple-500", purple600: "bg-purple-600", purple700: "bg-purple-700", purple800: "bg-purple-800", purple900: "bg-purple-900", purple950: "bg-purple-950",
	fuchsia300: "bg-fuchsia-300", fuchsia400: "bg-fuchsia-400", fuchsia500: "bg-fuchsia-500", fuchsia600: "bg-fuchsia-600", fuchsia700: "bg-fuchsia-700", fuchsia800: "bg-fuchsia-800", fuchsia900: "bg-fuchsia-900", fuchsia950: "bg-fuchsia-950",
	pink300: "bg-pink-300", pink400: "bg-pink-400", pink500: "bg-pink-500", pink600: "bg-pink-600", pink700: "bg-pink-700", pink800: "bg-pink-800", pink900: "bg-pink-900", pink950: "bg-pink-950",
	rose300: "bg-rose-300", rose400: "bg-rose-400", rose500: "bg-rose-500", rose600: "bg-rose-600", rose700: "bg-rose-700", rose800: "bg-rose-800", rose900: "bg-rose-900", rose950: "bg-rose-950",
};

export function get_bg_color(color: string) : string {
    return bg_color[color] ?? "bg-slate-950";
}

const border_color : Record<string, string> = {
	slate300: "border-slate-300", slate400: "border-slate-400", slate500: "border-slate-500", slate600: "border-slate-600", slate700: "border-slate-700", slate800: "border-slate-800", slate900: "border-slate-900", slate950: "border-slate-950",
	gray300: "border-gray-300", gray400: "border-gray-400", gray500: "border-gray-500", gray600: "border-gray-600", gray700: "border-gray-700", gray800: "border-gray-800", gray900: "border-gray-900", gray950: "border-gray-950",
	zinc300: "border-zinc-300", zinc400: "border-zinc-400", zinc500: "border-zinc-500", zinc600: "border-zinc-600", zinc700: "border-zinc-700", zinc800: "border-zinc-800", zinc900: "border-zinc-900", zinc950: "border-zinc-950",
	neutral300: "border-neutral-300", neutral400: "border-neutral-400", neutral500: "border-neutral-500", neutral600: "border-neutral-600", neutral700: "border-neutral-700", neutral800: "border-neutral-800", neutral900: "border-neutral-900", neutral950: "border-neutral-950",
	stone300: "border-stone-300", stone400: "border-stone-400", stone500: "border-stone-500", stone600: "border-stone-600", stone700: "border-stone-700", stone800: "border-stone-800", stone900: "border-stone-900", stone950: "border-stone-950",
	red300: "border-red-300", red400: "border-red-400", red500: "border-red-500", red600: "border-red-600", red700: "border-red-700", red800: "border-red-800", red900: "border-red-900", red950: "border-red-950",
	orange300: "border-orange-300", orange400: "border-orange-400", orange500: "border-orange-500", orange600: "border-orange-600", orange700: "border-orange-700", orange800: "border-orange-800", orange900: "border-orange-900", orange950: "border-orange-950",
	amber300: "border-amber-300", amber400: "border-amber-400", amber500: "border-amber-500", amber600: "border-amber-600", amber700: "border-amber-700", amber800: "border-amber-800", amber900: "border-amber-900", amber950: "border-amber-950",
	yellow300: "border-yellow-300", yellow400: "border-yellow-400", yellow500: "border-yellow-500", yellow600: "border-yellow-600", yellow700: "border-yellow-700", yellow800: "border-yellow-800", yellow900: "border-yellow-900", yellow950: "border-yellow-950",
	lime300: "border-lime-300", lime400: "border-lime-400", lime500: "border-lime-500", lime600: "border-lime-600", lime700: "border-lime-700", lime800: "border-lime-800", lime900: "border-lime-900", lime950: "border-lime-950",
	green300: "border-green-300", green400: "border-green-400", green500: "border-green-500", green600: "border-green-600", green700: "border-green-700", green800: "border-green-800", green900: "border-green-900", green950: "border-green-950",
	emerald300: "border-emerald-300", emerald400: "border-emerald-400", emerald500: "border-emerald-500", emerald600: "border-emerald-600", emerald700: "border-emerald-700", emerald800: "border-emerald-800", emerald900: "border-emerald-900", emerald950: "border-emerald-950",
	teal300: "border-teal-300", teal400: "border-teal-400", teal500: "border-teal-500", teal600: "border-teal-600", teal700: "border-teal-700", teal800: "border-teal-800", teal900: "border-teal-900", teal950: "border-teal-950",
	cyan300: "border-cyan-300", cyan400: "border-cyan-400", cyan500: "border-cyan-500", cyan600: "border-cyan-600", cyan700: "border-cyan-700", cyan800: "border-cyan-800", cyan900: "border-cyan-900", cyan950: "border-cyan-950",
	sky300: "border-sky-300", sky400: "border-sky-400", sky500: "border-sky-500", sky600: "border-sky-600", sky700: "border-sky-700", sky800: "border-sky-800", sky900: "border-sky-900", sky950: "border-sky-950",
	blue300: "border-blue-300", blue400: "border-blue-400", blue500: "border-blue-500", blue600: "border-blue-600", blue700: "border-blue-700", blue800: "border-blue-800", blue900: "border-blue-900", blue950: "border-blue-950",
	indigo300: "border-indigo-300", indigo400: "border-indigo-400", indigo500: "border-indigo-500", indigo600: "border-indigo-600", indigo700: "border-indigo-700", indigo800: "border-indigo-800", indigo900: "border-indigo-900", indigo950: "border-indigo-950",
	violet300: "border-violet-300", violet400: "border-violet-400", violet500: "border-violet-500", violet600: "border-violet-600", violet700: "border-violet-700", violet800: "border-violet-800", violet900: "border-violet-900", violet950: "border-violet-950",
	purple300: "border-purple-300", purple400: "border-purple-400", purple500: "border-purple-500", purple600: "border-purple-600", purple700: "border-purple-700", purple800: "border-purple-800", purple900: "border-purple-900", purple950: "border-purple-950",
	fuchsia300: "border-fuchsia-300", fuchsia400: "border-fuchsia-400", fuchsia500: "border-fuchsia-500", fuchsia600: "border-fuchsia-600", fuchsia700: "border-fuchsia-700", fuchsia800: "border-fuchsia-800", fuchsia900: "border-fuchsia-900", fuchsia950: "border-fuchsia-950",
	pink300: "border-pink-300", pink400: "border-pink-400", pink500: "border-pink-500", pink600: "border-pink-600", pink700: "border-pink-700", pink800: "border-pink-800", pink900: "border-pink-900", pink950: "border-pink-950",
	rose300: "border-rose-300", rose400: "border-rose-400", rose500: "border-rose-500", rose600: "border-rose-600", rose700: "border-rose-700", rose800: "border-rose-800", rose900: "border-rose-900", rose950: "border-rose-950",
};

export function get_border_color(color: string) : string {
    return border_color[color] ?? "border-sky-500";
}
