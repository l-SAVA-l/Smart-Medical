import { Search } from "lucide-react";
import { Button } from "../SMButton/SMButton";
import { Input } from "../SMInput/SMInput";

const SMSearchInput = () => {
    return (
        <div className="flex-1 max-w-md mx-8">
        <div className="relative">
        <Input
            type="text"
            placeholder="Поиск услуг и специалистов..."
            className="pl-4 pr-12 bg-gray-50 border-0 h-12 rounded-lg focus:outline-none focus:shadow-none focus:border-0 focus:ring-1 focus:ring-[#18A36C]"
        />
        <Button
            size="sm"
            className="absolute right-1 top-1 h-10 w-10 p-0 bg-[#18A36C] hover:bg-[#18A36C]/90"
        >
            <Search className="w-4 h-4 text-white" />
        </Button>
        </div>
        </div>
    )
};

export default SMSearchInput;

