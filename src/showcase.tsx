
function ShowcaseItem() {
    return <div className="border rounded-lg border-white/30 p-2">
        <div className="font-medium text-lg">Game asset manager</div>
        <div>15 functions</div>
        <div className="flex gap-2">
            <button>import</button>
            <button>stamp</button>
        </div>
    </div>
}

export default function Showcase() {
    return (
        <div className="h-full w-full">
            <div className="text-2xl">Showcase your contracts to the world</div>
            <div className="grid grid-cols-3 p-2 gap-2">
                <ShowcaseItem />
                <ShowcaseItem />
                <ShowcaseItem />
                <ShowcaseItem />

            </div>
        </div>
    )
}