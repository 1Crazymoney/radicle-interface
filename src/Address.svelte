<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-routing';
  import { ethers } from 'ethers';
  import { safeLink, explorerLink, identifyAddress, formatAddress, AddressType, parseEnsLabel } from '@app/utils';
  import { Profile, ProfileType } from '@app/profile';
  import Avatar from "@app/Avatar.svelte";
  import type { Config } from '@app/config';

  export let address: string;
  export let config: Config;
  export let resolve = false;
  export let noBadge = false;
  export let noAvatar = false;
  export let compact = false;
  // This property allows components eg. Header.svelte to pass a resolved profile object.
  export let profile: Profile | null = null;

  let addressType: AddressType | null = null;

  const nameOrAddress = profile?.ens?.name || address;

  onMount(async () => {
    if (! profile) {
      identifyAddress(address, config).then((t: AddressType) => addressType = t);

      if (resolve) {
        Profile.get(address, ProfileType.Minimal, config).then(p => profile = p);
      }
    } else {
      // If there is a profile we can use the profile.type to avoid identifying it again.
      addressType = profile.type;
    }
  });
  $: addressLabel = resolve && profile?.name ? compact ? parseEnsLabel(profile.name, config) : profile.name : checksumAddress;
  $: checksumAddress = compact
    ? formatAddress(address)
    : ethers.utils.getAddress(address);
</script>

<style>
  .address {
    display: inline-flex;
    align-items: center;
    height: 100%;
  }
  .address.no-badge .badge {
    display: none;
  }
  .address a {
    color: var(--color-foreground-90);
  }
  .address a:hover {
    color: var(--color-foreground);
  }
</style>

<div class="address" title={address} class:no-badge={noBadge}>
  {#if !noAvatar}
    {#if resolve && profile?.avatar}
      <Avatar inline source={profile.avatar} {address}/>
    {:else}
      <Avatar inline source={address} {address}/>
    {/if}
  {/if}
  {#if addressType === AddressType.Org}
    <a use:link href={`/${nameOrAddress}`}>{addressLabel}</a>
    <span class="badge">org</span>
  {:else if addressType === AddressType.Safe}
    <a href={safeLink(address, config)} target="_blank">{addressLabel}</a>
    <span class="badge safe">safe</span>
  {:else if addressType === AddressType.Contract}
    <a href={explorerLink(address, config)} target="_blank">{addressLabel}</a>
    <span class="badge">contract</span>
  {:else if addressType === AddressType.EOA}
    <a use:link href={`/${nameOrAddress}`}>{addressLabel}</a>
  {:else} <!-- While we're waiting to find out what address type it is -->
    <a href={explorerLink(address, config)} target="_blank">{addressLabel}</a>
  {/if}
</div>
