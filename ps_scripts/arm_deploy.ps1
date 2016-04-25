# To login to Azure Resource Manager
Login-AzureRmAccount

#################### Help to develop templates
## rsource manager schemas
https://github.com/Azure/azure-resource-manager-schemas/tree/master/schemas

## list all resource providers avaialbe in the region
Get-AzureRmResourceProvider

## list resource types for the provider & Api Versions
(Get-AzureRmResourceProvider -ProviderNamespace Microsoft.Network).ResourceTypes
(Get-AzureRmResourceProvider -ProviderNamespace Microsoft.Compute).ResourceTypes
(Get-AzureRmResourceProvider -ProviderNamespace Microsoft.Storage).ResourceTypes
## get API versions of a particular Resource Type
((Get-AzureRmResourceProvider -ProviderNamespace Microsoft.Web).ResourceTypes | Where-Object ResourceTypeName -eq sites).ApiVersions

# New Resource Group
New-AzureRmResourceGroup -Name "MultiVIPTest" -Location "North Europe"

# Test deployment
Test-AzureRmResourceGroupDeployment -ResourceGroupName MultiVIPTest -TemplateFile .\arm\arm-empty.json -myParameterName "parameterValue"

# Inline parameters
New-AzureRmResourceGroupDeployment -Name MultiVIPTestDep1 -ResourceGroupName MultiVIPTest -TemplateFile .\arm\multivip_lb.json 

# parameter object
$parameters = @{"<ParameterName>"="<Parameter Value>"}
New-AzureRmResourceGroupDeployment -Name ExampleDeployment -ResourceGroupName ExampleResourceGroup -TemplateFile <PathOrLinkToTemplate> -TemplateParameterObject $parameters

###### errors
loadBalancingRule use the same protocol and backend port (Tcp 22) and must not be used with the same backend address pool

LoadBalancerFrontendIPConfigurationCountLimitReached","message":"A load balancer cannot have more than 5 FrontendIPConfigurations

