### 2.4.0  (2018-05-29)


#### Bug Fixes

* NONE

#### Features

* SOQL syntax includes support for 'SELECT {TABLE:FIELD} FROM...'

#### Breaking Changes

* NONE

### 2.3.0  (2018-01-23)


#### Bug Fixes

* NONE

#### Features

* Mulitple IN clauses in localStorage soql interface.
* LIKE clauses in localStorage soql interface.

#### Breaking Changes

* NONE



### 2.2.0  (2017-01-23)


#### Bug Fixes

* NONE

#### Features

* Electron Support.

#### Breaking Changes

* NONE

### 2.1.3  (2016-10-17)


#### Bug Fixes

* NONE

#### Features

* Fixed es6 dep to 3.3.1 as v4 was breaking unit tests due to it not auto-polyilling.

#### Breaking Changes

* NONE


### 2.1.2  (2016-09-06)


#### Bug Fixes

* Sily typo

#### Features

* NONE.

#### Breaking Changes

* NONE


### 2.1.1  (2016-09-06)


#### Bug Fixes

* Fixed issue with p2mRefreshRecTypeDOTs call when running mock on recorded data that does not contain mock

#### Features

* NONE.

#### Breaking Changes

* NONE

### 2.1.0  (2016-09-06)


#### Bug Fixes

* Fixed issue with SOQL WHERE call when passing integer as match.

#### Features

* Adding support for DOTs local (mock) data.

#### Breaking Changes

* NONE


### 2.0.0  (2016-04-29)


#### Bug Fixes

* Fixed updating of records in MockSmartStore, previously was keeping unspecified fields in updates.
* Better, more robust scrubbing.

#### Features

* Support of v0.1.0 of mobilecaddy-utils
* Removed over-excited logging in MockSmartStore and mockVfRemote
* Partial support for "SELECT ... IN..." SOQL
* Adding mobileLogger to mcUtilsMock to support unit testing

#### Breaking Changes

* Min v3 of npm required. See [Dev Guides](http://developer.mobilecaddy.net) for information on using previous versions


### 1.0.3  (2015-11-18)


#### Bug Fixes

* Updated mcUtilsMock to better work with e2e tests

#### Features

* NONE

#### Breaking Changes

* NONE


### 1.0.2  (2015-11-17)


#### Bug Fixes

* Fixed bug with `scub=full`

#### Features

* NONE

#### Breaking Changes

* NONE


### 1.0.1  (2015-10-27)


#### Bug Fixes

* Removed erroneous _main_ pair from package.json (caused issue on latest node)

#### Features

* NONE

#### Breaking Changes

* NONE



### 1.0.0  (2015-10-16)


#### Bug Fixes

* Scrubbing was not clearing all tables in all scenarios. Should now work

#### Features

* NONE

#### Breaking Changes

* Use on packages only containing 'mobilecaddy1' namespace


### 0.0.3  (2015-10-04)


#### Bug Fixes

* None

#### Features

* NPM Support

#### Breaking Changes

* none


### 0.0.2  (2015-09-25)


#### Bug Fixes

* Updates following linting - naughty boy!

#### Features

* Support for _some_ smartQuery requests
* Support for call to SDFC to create "New Install" record on run up

#### Breaking Changes

* none


### 0.0.1-alpha.5 unstable (2015-07-14)


#### Bug Fixes

* MockCordova fix for missing _soupEntryId field
* MockCordova fix for missing _soupLastModifiedDate#
* mockVFRemote refresh calls now have correctly updated refresh time

#### Features

* Moved CORS server in to here

#### Breaking Changes

* none


### 0.0.1-alpha.4 (2015-05-06)


#### Bug Fixes

* none

#### Features

* Initial run up now more closely resembles device run up.
* mockVFRemote now better spoofs connection-session interactions.

#### Breaking Changes

* Directory for mock JSON files renamed from "test" to "mock". You may need to update your project structure if you upgrade from pre alpha.4

