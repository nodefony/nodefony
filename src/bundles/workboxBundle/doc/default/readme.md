# Welcome to workbox bundle

#### This bundle is auto loaded in framework in ./config/generatedConfig.yml
```yaml
system:
  bundles:
    workbox: /Users/cci/repository/nodefony-core/src/bundles/workboxBundle
```

#### For a durable usage you can add this permanently in ./config/config.yml

```yaml
#
#        NODEFONY FRAMEWORK CONFIG YAML FILE
#
#
# This file is YAML  FILE
# ---
# YAML: YAML Ain't Markup Language
#
# What It Is: YAML is a human friendly data serialization
#   standard for all programming languages.
#
#
#########################################################
#
#  NODEFONY FRAMEWORK
#
#       KERNEL CONFIG
#
#
system:
  domain                        : localhost             # nodefony can listen only one domain ( no vhost )  /    [::1] for IPV6 only
  domainAlias:                                          # domainAlias string only <<regexp>>   example ".*\\.nodefony\\.com  ^nodefony\\.eu$ ^.*\\.nodefony\\.eu$"
    - "^127.0.0.1$"
  httpPort                      : 5151
  httpsPort                     : 5152
  statics                       : true
  security                      : true
  realtime                      : true
  monitoring                    : true
  documentation                 : true
  unitTest                      : true
  locale                        : "en_en"

  bundles:
    workbox                        : /Users/cci/repository/nodefony-core/src/bundles/workboxBundle
```


## <a name="authors"></a>Authors

- admin  admin@nodefony.com

##  <a name="license"></a>License
