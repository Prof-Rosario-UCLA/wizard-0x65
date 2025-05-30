function Tooltip({
    description,
    name,
    health,
    damage,
    price,
    children,
}: {
    description: string;
    name: string;
    health: number;
    damage: number;
    price: number;
    children: React.ReactNode;
}) {
    return (
        <div className="relative group inline-block cursor-pointer text-left">
            {children}
            <div className="absolute left-full top-0 mb-2 hidden border border-white group-hover:flex bg-black text-white text-xs px-2 py-1 rounded shadow z-50 w-[9rem]">
                <div className="flex flex-col w-full p-2 gap-4">
                    <div className="font-bold text-base">{name}</div>
                    <div className="bg-gray-600/40 px-2 py-1 rounded-lg w-fit flex gap-2 items-center">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                        {price} bytes
                    </div>

                    <div>{description}</div>
                    <hr className="opacity-60"></hr>
                    <div className="flex justify-between w-full gap-1">
                        <div className="flex flex-col justify-center items-center bg-gray-600/40 rounded-lg p-2 min-w-[3rem]">
                            <div className="font-bold" title="Runtime">
                                RT
                            </div>
                            {health}
                        </div>
                        <div className="flex flex-col justify-center items-center bg-gray-600/40 rounded-lg p-2 min-w-[3rem]">
                            <div className="font-bold" title="Clockspeed">
                                CS
                            </div>
                            {damage}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Tooltip };
