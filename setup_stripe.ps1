$ErrorActionPreference = "Stop"

Write-Host "Creating products..."
$rookieProd = (stripe products create --name "Rookie Pass" -d description="Entry tier membership" | ConvertFrom-Json)
$basicProd = (stripe products create --name "Standard Membership" -d description="Standard tier membership" | ConvertFrom-Json)
$proProd = (stripe products create --name "Premium Membership" -d description="Premium tier membership" | ConvertFrom-Json)

$charityProd = (stripe products create --name "Charity Donation" -d description="Donation for charity events" | ConvertFrom-Json)

$smallOpProd = (stripe products create --name "Operator Subscription - Small" -d description="Small operator tier" | ConvertFrom-Json)
$medOpProd = (stripe products create --name "Operator Subscription - Medium" -d description="Medium operator tier" | ConvertFrom-Json)
$largeOpProd = (stripe products create --name "Operator Subscription - Large" -d description="Large operator tier" | ConvertFrom-Json)
$megaOpProd = (stripe products create --name "Operator Subscription - Mega" -d description="Mega operator tier" | ConvertFrom-Json)


Write-Host "Creating prices..."
$rookiePrice = (stripe prices create --product $rookieProd.id --unit-amount 2000 --currency usd --recurring.interval month | ConvertFrom-Json)
$basicPrice = (stripe prices create --product $basicProd.id --unit-amount 2500 --currency usd --recurring.interval month | ConvertFrom-Json)
$proPrice = (stripe prices create --product $proProd.id --unit-amount 6000 --currency usd --recurring.interval month | ConvertFrom-Json)

$charity5 = (stripe prices create --product $charityProd.id --unit-amount 500 --currency usd | ConvertFrom-Json)
$charity10 = (stripe prices create --product $charityProd.id --unit-amount 1000 --currency usd | ConvertFrom-Json)
$charity25 = (stripe prices create --product $charityProd.id --unit-amount 2500 --currency usd | ConvertFrom-Json)
$charity50 = (stripe prices create --product $charityProd.id --unit-amount 5000 --currency usd | ConvertFrom-Json)
$charity100 = (stripe prices create --product $charityProd.id --unit-amount 10000 --currency usd | ConvertFrom-Json)
$charity250 = (stripe prices create --product $charityProd.id --unit-amount 25000 --currency usd | ConvertFrom-Json)
$charity500 = (stripe prices create --product $charityProd.id --unit-amount 50000 --currency usd | ConvertFrom-Json)

$smallOpPrice = (stripe prices create --product $smallOpProd.id --unit-amount 9900 --currency usd --recurring.interval month | ConvertFrom-Json)
$medOpPrice = (stripe prices create --product $medOpProd.id --unit-amount 19900 --currency usd --recurring.interval month | ConvertFrom-Json)
$largeOpPrice = (stripe prices create --product $largeOpProd.id --unit-amount 29900 --currency usd --recurring.interval month | ConvertFrom-Json)
$megaOpPrice = (stripe prices create --product $megaOpProd.id --unit-amount 49900 --currency usd --recurring.interval month | ConvertFrom-Json)

$output = @{
    rookie_monthly = $rookiePrice.id
    basic_monthly = $basicPrice.id
    pro_monthly = $proPrice.id
    small = $smallOpPrice.id
    medium = $medOpPrice.id
    large = $largeOpPrice.id
    mega = $megaOpPrice.id
    charity_product = $charityProd.id
    charity_donations = @{
        "5" = $charity5.id
        "10" = $charity10.id
        "25" = $charity25.id
        "50" = $charity50.id
        "100" = $charity100.id
        "250" = $charity250.id
        "500" = $charity500.id
    }
}

$output | ConvertTo-Json -Depth 4 > stripe_outputs.json
Write-Host "Done! Saved to stripe_outputs.json"
