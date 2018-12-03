# Welcome to uikit bundle

#### This bundle is auto loaded in framework in ./config/generatedConfig.yml
```yaml
system:
  bundles:
    uikit: file:/Users/christophecamensuli/repository/nodefony-core/src/bundles/uikit-bundle
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
  domainCheck                   : true
  statics                       : true
  security                      : true
  realtime                      : true
  monitoring                    : true
  documentation                 : true
  unitTest                      : true
  locale                        : "en_en"

  bundles:
    uikit-bundle                        : file:/Users/christophecamensuli/repository/nodefony-core/src/bundles/uikit-bundle
```


## <a name="authors"></a>Authors

- admin  admin@nodefony.com

##  <a name="license"></a>License
