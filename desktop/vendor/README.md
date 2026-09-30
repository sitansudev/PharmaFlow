# Windows PostgreSQL runtime

Before producing a Windows release, put a complete portable PostgreSQL runtime
in this folder as `pgsql/`. It must contain `bin/initdb.exe`, `bin/pg_ctl.exe`,
`bin/psql.exe`, `bin/createdb.exe`, the matching libraries, and `share/`.

The binary runtime is excluded from Git. The release script copies it into the
installer, and the app creates each user's private database on first launch.
