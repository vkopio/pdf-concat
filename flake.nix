{
  description = "Dev and build env for pdf-concat.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ... }:
  let
    system = "x86_64-linux";
  in {
    devShells."${system}".default = let pkgs = import nixpkgs {
      inherit system;
    };
    in pkgs.mkShell rec {
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
      ];

      LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath nativeBuildInputs;
    };
  };
}
