import { MenuIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../_components/ui/button"
import { Card, CardContent } from "../_components/ui/card"
import { ModeToggle } from "../_components/ui/dark-mode"
import { Sheet, SheetTrigger } from "../_components/ui/sheet"
import SidebarAdm from "./sidebar-adm"
const Header = () => {
  return (
    <div>
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-5">
          <Link href="/">
            <Image src="/logonew.svg" alt="logo" width={80} height={120} />
          </Link>
          <div className="flex items-center gap-3">
            <Sheet>
              {/* Dark mode toggle */}
              <ModeToggle />
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SidebarAdm />
            </Sheet>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Header
