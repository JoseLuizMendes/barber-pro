import MonthlyRecipe from "@/app/_components-adm/monthly-recipe"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"
import Link from "next/link"

const ServicesPages = () => {
  return (
    <div>
      Services Page
      <div>
        <Card>
          <CardContent>
            <Link href="/adm/services">
              <Button>
                <MonthlyRecipe />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ServicesPages
