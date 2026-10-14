require "json"
require "net/http"

module Auth
  class JwksCache
    Entry = Data.define(:keys, :fetched_at)
    MAX_DOCUMENT_BYTES = 65_536
    MAX_KEYS = 20

    @entries = {}
    @mutex = Mutex.new

    class << self
      def key_for(configuration, kid, fetcher: nil)
        keys = load_keys(configuration, fetcher:)
        return keys.fetch(kid) if keys.key?(kid)

        refreshed = load_keys(configuration, fetcher:, force: true)
        refreshed.fetch(kid) { raise InvalidTokenError.new }
      end

      def reset!
        @mutex.synchronize { @entries.clear }
      end

      private

      def load_keys(configuration, fetcher:, force: false)
        @mutex.synchronize do
          now = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          entry = @entries[configuration.jwks_url]
          return entry.keys if !force && entry && now - entry.fetched_at < configuration.cache_ttl

          begin
            document = fetcher ? fetcher.call : fetch_document(configuration.jwks_url)
            keys = normalize_keys(document)
            @entries[configuration.jwks_url] = Entry.new(keys:, fetched_at: now)
            keys
          rescue InvalidTokenError
            raise
          rescue StandardError
            return entry.keys if entry && now - entry.fetched_at < configuration.stale_ttl

            raise ServiceUnavailableError.new
          end
        end
      end

      def fetch_document(url)
        uri = URI.parse(url)
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        http.open_timeout = 2
        http.read_timeout = 3

        response = http.request(Net::HTTP::Get.new(uri.request_uri, { "Accept" => "application/json" }))
        raise "JWKS returned #{response.code}" unless response.is_a?(Net::HTTPSuccess)
        raise "JWKS document is too large" if response.body.bytesize > MAX_DOCUMENT_BYTES

        JSON.parse(response.body)
      end

      def normalize_keys(document)
        raw_keys = document.fetch("keys")
        raise InvalidTokenError.new unless raw_keys.is_a?(Array) && raw_keys.length.between?(1, MAX_KEYS)

        raw_keys.each_with_object({}) do |key, result|
          kid = key["kid"]
          next unless kid.is_a?(String) && /\A[A-Za-z0-9._:-]{1,128}\z/.match?(kid)

          result[kid] = key.freeze
        end.freeze.tap do |keys|
          raise InvalidTokenError.new if keys.empty?
        end
      rescue KeyError, TypeError
        raise InvalidTokenError.new
      end
    end
  end
end
