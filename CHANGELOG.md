<a name="0.11.0"></a>
# [0.11.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.10.0...0.11.0) (2019-03-01)


### Features

* add support for minItems keyword ([af7ef8f](https://bitbucket.org/atlassian/json-schema-diff/commits/af7ef8f))



<a name="0.10.0"></a>
# [0.10.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.9.0...0.10.0) (2019-02-28)


### Features

* add support for the array items keyword ([6cc5f9e](https://bitbucket.org/atlassian/json-schema-diff/commits/6cc5f9e))



<a name="0.9.0"></a>
# [0.9.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.8.3...0.9.0) (2019-02-07)


### Features

* add support for required keyword ([2290b74](https://bitbucket.org/atlassian/json-schema-diff/commits/2290b74))


### BREAKING CHANGES

* Prior to this change the nodejs api returned added and removed differences detected as as an array of DiffResultDifference objects. Now the added and removed differences are returned as two seperate JsonSchema objects. In addition all the property names of the DiffResult object have been renamed. To migrate, update code that consumes the DiffResult object returned by the API to the new property names and types.



<a name="0.8.3"></a>
## [0.8.3](https://bitbucket.org/atlassian/json-schema-diff/compare/0.8.2...0.8.3) (2019-01-02)


### Bug Fixes

* fix race condition in the watch loop for unit tests ([5753cab](https://bitbucket.org/atlassian/json-schema-diff/commits/5753cab))



<a name="0.8.2"></a>
## [0.8.2](https://bitbucket.org/atlassian/json-schema-diff/compare/0.8.1...0.8.2) (2018-08-08)


### Bug Fixes

* declare lodash as production dependency ([2e7aa69](https://bitbucket.org/atlassian/json-schema-diff/commits/2e7aa69))



<a name="0.8.1"></a>
## [0.8.1](https://bitbucket.org/atlassian/json-schema-diff/compare/0.8.0...0.8.1) (2018-07-17)


### Bug Fixes

* throw an error when schema contains circular references instead of overflowing the stack ([60d4db1](https://bitbucket.org/atlassian/json-schema-diff/commits/60d4db1))



<a name="0.8.0"></a>
# [0.8.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.7.0...0.8.0) (2018-07-16)


### Features

* changed public api to return locations as arrays instead of strings ([f86a5dd](https://bitbucket.org/atlassian/json-schema-diff/commits/f86a5dd))



<a name="0.7.0"></a>
# [0.7.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.6.0...0.7.0) (2018-07-12)


### Features

* added public programmable api and removed support for allOf, anyOf and not keywords ([0c15017](https://bitbucket.org/atlassian/json-schema-diff/commits/0c15017))



<a name="0.6.0"></a>
# [0.6.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.5.0...0.6.0) (2018-05-23)


### Features

* add support for json schema references ([76a0457](https://bitbucket.org/atlassian/json-schema-diff/commits/76a0457))



<a name="0.5.0"></a>
# [0.5.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.4.0...0.5.0) (2018-05-23)


### Features

* add support for boolean schemas ([519f648](https://bitbucket.org/atlassian/json-schema-diff/commits/519f648))
* add support for properties and additionalProperties ([f68a38a](https://bitbucket.org/atlassian/json-schema-diff/commits/f68a38a))



<a name="0.4.0"></a>
# [0.4.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.3.0...0.4.0) (2018-05-03)


### Features

* add support for anyOf keyword ([1753af1](https://bitbucket.org/atlassian/json-schema-diff/commits/1753af1))



<a name="0.3.0"></a>
# [0.3.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.2.0...0.3.0) (2018-05-02)


### Features

* add support for the not keyword ([c9b7e98](https://bitbucket.org/atlassian/json-schema-diff/commits/c9b7e98))



<a name="0.2.0"></a>
# [0.2.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.1.0...0.2.0) (2018-04-23)


### Features

* add support for the allOf keyword ([e329acd](https://bitbucket.org/atlassian/json-schema-diff/commits/e329acd))



<a name="0.1.0"></a>
# [0.1.0](https://bitbucket.org/atlassian/json-schema-diff/compare/0.0.1...0.1.0) (2018-04-19)


### Features

* add check for type ([1c23987](https://bitbucket.org/atlassian/json-schema-diff/commits/1c23987))



