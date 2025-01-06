{
  description = "Dev and build env for pdf-concat.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          name = "pdf-concat";
          version = "0.1.0";
          src = ./.;
          overlays = [ (import rust-overlay) ];
          pkgs = import nixpkgs {
            inherit system overlays;
          };
          rustToolchain = pkgs.pkgsBuildHost.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;

          nativeBuildInputs = with pkgs; [
            cargo
            just
            lld
            nodejs_22
            pdfium-binaries
            rust-analyzer
            rustc
            rustfmt
            rustup
            rustToolchain
            pkg-config
          ];

          buildInputs = with pkgs; [ nixpkgs-fmt openssl ];
        in
        with pkgs;
        {
          devShells.default = mkShell {
            inherit buildInputs nativeBuildInputs;

            LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath nativeBuildInputs;
          };

          packages.default = derivation {
            inherit system name src buildInputs nativeBuildInputs;
            builder = with pkgs; "${bash}/bin/bash";
            args = [ "-c" "echo foo > $out" ];
          };
        }
      );
}
