go test -race ./...
go build -o drydock ./cmd/drydock
./scripts/smoke_test.sh
./drydock up --config drydock.example.yaml
