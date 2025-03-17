"use client";

import {Button} from "@/components/ui/button";
import {AlignJustify} from "lucide-react";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Badge} from "@/components/ui/badge";

type MenuNavProps = {
    items: {
        title: string;
        route: string;
    }[];
};

export default function MenuNav({items}: MenuNavProps) {
    const pathname = usePathname();

    return (
        <Sheet>
            <div className="border-b border-solid border-border p-4 w-full z-40">
                <SheetTrigger asChild>
                    <div className="flex flex-row space-x-2 items-center">
                        <Button variant="ghost">
                            <AlignJustify className="h-6 w-6"/>
                        </Button>
                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-[-2px]">
                            {items.find(item => item.route === pathname)?.title ?? null}
                        </h4>
                    </div>
                </SheetTrigger>
            </div>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="border-b border-solid border-border pb-4">Menu</SheetTitle>
                    <SheetDescription>
                        <div className="space-y-2">
                            {items.map((item, index) => {
                                const isCurrentRoute = pathname === item.route;

                                return (
                                    <Link key={index} href={item.route} className="block">
                                        <SheetTrigger className="w-full">
                                            <Button
                                                className="w-full justify-start"
                                                variant={isCurrentRoute ? "default" : "outline"}
                                            >
                                                <Badge
                                                    variant={isCurrentRoute ? "secondary" : "default"}
                                                    className="rounded-[4px] mr-4"
                                                >
                                                    {index + 1}
                                                </Badge>
                                                <span>{item.title}</span>
                                            </Button>
                                        </SheetTrigger>
                                    </Link>
                                );
                            })}
                        </div>
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
