using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;

namespace ReportPlatform;

// ── 對應規格書 JWE JSON 結構 ──────────────────────────────────
public class JwePayload
{
    [JsonPropertyName("protected")]
    public string Protected { get; set; } = "";

    [JsonPropertyName("encrypted_key")]
    public string EncryptedKey { get; set; } = "";

    [JsonPropertyName("iv")]
    public string Iv { get; set; } = "";

    [JsonPropertyName("ciphertext")]
    public string Ciphertext { get; set; } = "";

    [JsonPropertyName("tag")]
    public string Tag { get; set; } = "";
}

public static class JweService
{
    private static readonly SymmetricSecurityKey g_kek = BuildKek();

    /// <summary>
    /// 串接平台配發的 A part + B part，Base64Url Decode 取得 KEK。
    /// </summary>
    private static SymmetricSecurityKey BuildKek()
    {
        // 建議存在 appsettings.json
        string aPart = "NeYEYqIctN3rIMmVm2uf8";
        string bPart = "Ga0MuvUFUUHf8enWfYoVcQ";

        byte[] kekBytes = Base64UrlEncoder.DecodeBytes(aPart + bPart);
        return new SymmetricSecurityKey(kekBytes);
    }

    /// <summary>
    /// 加密，傳入原始 JSON 字串（不需要再 Serialize），回傳 JwePayload。
    /// </summary>
    public static JwePayload Encrypt(string plaintext)
    {
        JwePayload m_return = new();

        try
        {
            // 1. Protected Header（規格書固定格式）
            // 規格書規定：Header 固定格式，欄位順序不可變動
            string FixedHeaderJson = "{\"enc\":\"A256CBC-HS512\",\"alg\":\"A256KW\"}";
            byte[] headerBytes = Encoding.UTF8.GetBytes(FixedHeaderJson);
            string protectedEnc = Base64UrlEncoder.Encode(headerBytes);

            // 2. 生成 CEK（512 bit / 64 byte）
            byte[] cek = new byte[64];
            RandomNumberGenerator.Fill(cek);

            // 3. AES Key Wrap：用 KEK 包裝 CEK
            byte[] wrappedCek = WrapKey(cek);

            // 4. AES-256-CBC + HMAC-SHA-512 加密
            var encProvider = new AuthenticatedEncryptionProvider(new SymmetricSecurityKey(cek), SecurityAlgorithms.Aes256CbcHmacSha512);

            byte[] aad = Encoding.ASCII.GetBytes(protectedEnc);
            AuthenticatedEncryptionResult result = encProvider.Encrypt(Encoding.UTF8.GetBytes(plaintext), aad);

            m_return = new JwePayload
            {
                Protected = protectedEnc,
                EncryptedKey = Base64UrlEncoder.Encode(wrappedCek),
                Iv = Base64UrlEncoder.Encode(result.IV),
                Ciphertext = Base64UrlEncoder.Encode(result.Ciphertext),
                Tag = Base64UrlEncoder.Encode(result.AuthenticationTag)
            };
        }
        catch (Exception ex)
        {
            m_return = null;
        }

        return m_return;
    }

    /// <summary>
    /// 解密，直接傳入 JWE JSON 字串解密。
    /// </summary>
    public static string Decrypt(string jweJson)
    {
        if (string.IsNullOrWhiteSpace(jweJson))
            throw new ArgumentException("JWE JSON 不可為空", nameof(jweJson));

        var jwe = JsonSerializer.Deserialize<JwePayload>(jweJson)
                  ?? throw new ArgumentException("無效的 JWE JSON");

        return Decrypt(jwe);
    }

    /// <summary>
    /// 解密，傳入 JwePayload 物件，驗證 Tag 後回傳原始明文字串。
    /// </summary>
    public static string Decrypt(JwePayload jwe)
    {
        string m_return = string.Empty;

        try
        {
            // 1. 驗證 Header 演算法
            string headerJson = Encoding.UTF8.GetString(Base64UrlEncoder.DecodeBytes(jwe.Protected));

            using var doc = JsonDocument.Parse(headerJson);
            string enc = doc.RootElement.GetProperty("enc").GetString()!;
            string alg = doc.RootElement.GetProperty("alg").GetString()!;

            if (!enc.Equals("A256CBC-HS512", StringComparison.OrdinalIgnoreCase) || !alg.Equals("A256KW", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException($"不支援的演算法: alg={alg}, enc={enc}");

            // 2. Key Unwrap → 還原 CEK
            byte[] cek = UnwrapKey(Base64UrlEncoder.DecodeBytes(jwe.EncryptedKey));

            // 3. AES-256-CBC 解密 + 驗證 Authentication Tag
            var decProvider = new AuthenticatedEncryptionProvider(new SymmetricSecurityKey(cek), SecurityAlgorithms.Aes256CbcHmacSha512);

            byte[] ciphertext = Base64UrlEncoder.DecodeBytes(jwe.Ciphertext);
            byte[] aad = Encoding.ASCII.GetBytes(jwe.Protected.Trim());
            byte[] iv = Base64UrlEncoder.DecodeBytes(jwe.Iv);  
            byte[] tag = Base64UrlEncoder.DecodeBytes(jwe.Tag);  

            // Decrypt 內部自動驗證 Tag，不符合時拋出 SecurityTokenDecryptionFailedException
            byte[] plain = decProvider.Decrypt(ciphertext, aad, iv, tag);

            m_return = Encoding.UTF8.GetString(plain);
        }
        catch (Exception ex)
        {

        }

        return m_return;
    }

    // ── Key Wrap / Unwrap ─────────────────────────────────────
    private static byte[] WrapKey(byte[] cek)
    {
        var provider = CryptoProviderFactory.Default.CreateKeyWrapProvider(g_kek, SecurityAlgorithms.Aes256KW);

        try
        {
            return provider.WrapKey(cek);
        }
        catch (Exception ex)
        {
            throw new SecurityTokenEncryptionFailedException("Key Wrap 失敗", ex);
        }
        finally
        {
            CryptoProviderFactory.Default.ReleaseKeyWrapProvider(provider);
        }
    }

    private static byte[] UnwrapKey(byte[] wrappedKey)
    {
        var provider = CryptoProviderFactory.Default.CreateKeyWrapProvider(g_kek, SecurityAlgorithms.Aes256KW);

        try
        {
            return provider.UnwrapKey(wrappedKey);
        }
        catch (Exception ex)
        {
            throw new SecurityTokenDecryptionFailedException("Key Unwrap 失敗", ex);
        }
        finally
        {
            CryptoProviderFactory.Default.ReleaseKeyWrapProvider(provider);
        }
    }
}